import { NextRequest, NextResponse } from "next/server";
import { google, sheets_v4 } from "googleapis";
import { promises as fs } from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  assignAllUnassignedFirstTimers,
  getLeastLoadedCaller,
} from "@/lib/utils/assign-caller";
import { getCurrentActor, isAdminLike } from "@/lib/auth/server";

type FirstTimerIntegration = {
  id: string;
  branch_id: string;
  sheet_id: string;
  sheet_range: string | null;
};

function normalizeText(value: string | null | undefined) {
  return String(value || "").trim();
}

function normalizeContact(contact: string | null | undefined) {
  const raw = normalizeText(contact).toLowerCase();
  if (!raw || raw === "none" || raw === "null" || raw === "n/a" || raw === "no contact") {
    return "";
  }

  const digits = raw.replace(/\D/g, "");
  if (!digits) return raw;

  if (digits.length === 10 && digits.startsWith("0")) {
    return `+233${digits.slice(1)}`;
  }

  if (digits.length === 12 && digits.startsWith("233")) {
    return `+${digits}`;
  }

  return digits;
}

function normalizeVisitType(value: string | null | undefined) {
  return normalizeText(value).toUpperCase().replace(/\s+/g, " ");
}

async function loadGoogleCredentials() {
  const jsonString =
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.SERVICE_ACCOUNT_JSON;

  if (jsonString) {
    return JSON.parse(jsonString);
  }

  const serviceAccountFile =
    process.env.GOOGLE_SERVICE_ACCOUNT_PATH || "alpha-evangelism-service-account.json";
  const serviceAccountPath = path.resolve(process.cwd(), serviceAccountFile);
  return JSON.parse(await fs.readFile(serviceAccountPath, "utf8"));
}

async function getSheetsClient() {
  const credentials = await loadGoogleCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

async function resolveIntegrations(
  request: NextRequest,
  requestedBranchId: string | null
) {
  const { actor } = await getCurrentActor();
  const adminClient = createAdminClient();

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const isCron = !!cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!actor) {
    if (!isCron) {
      throw new Error("Unauthorized");
    }

    let query = adminClient
      .from("branch_integrations")
      .select("id, branch_id, sheet_id, sheet_range")
      .eq("integration_type", "first_timer_intake")
      .eq("status", "active");

    if (requestedBranchId) {
      query = query.eq("branch_id", requestedBranchId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as FirstTimerIntegration[];
  }

  if (!isAdminLike(actor)) {
    throw new Error("Unauthorized");
  }

  let query = adminClient
    .from("branch_integrations")
    .select("id, branch_id, sheet_id, sheet_range")
    .eq("integration_type", "first_timer_intake")
    .eq("status", "active");

  if (actor.role === "admin") {
    if (!actor.branchId) throw new Error("Admin account has no branch.");
    query = query.eq("branch_id", actor.branchId);
  } else if (requestedBranchId) {
    query = query.eq("branch_id", requestedBranchId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as FirstTimerIntegration[];
}

async function readSheetRows(
  sheets: sheets_v4.Sheets,
  sheetId: string,
  range: string | null
) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: range || "Form Responses 1!A:H",
  });

  return response.data.values || [];
}

async function syncSingleBranch(
  integration: FirstTimerIntegration,
  sheets: sheets_v4.Sheets
) {
  const adminClient = createAdminClient();
  const rows = await readSheetRows(sheets, integration.sheet_id, integration.sheet_range);

  if (rows.length < 2) {
    return {
      branchId: integration.branch_id,
      inserted: 0,
      updated: 0,
      autoAssigned: 0,
      errors: [] as string[],
    };
  }

  const headers = rows[0].map((header) => normalizeText(String(header)));
  const dataRows = rows.slice(1);

  const { data: existingFirstTimers } = await adminClient
    .from("first_timers")
    .select("id, full_name, contact")
    .eq("branch_id", integration.branch_id);

  const existingByKey = new Map(
    (existingFirstTimers || []).map((item) => [
      `${normalizeText(item.full_name).toLowerCase()}::${normalizeContact(item.contact)}`,
      item,
    ])
  );

  let inserted = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const row of dataRows) {
    const payload: Record<string, unknown> = {
      branch_id: integration.branch_id,
    };

    headers.forEach((header, index) => {
      const value = normalizeText(row[index]);
      if (!value) return;

      if (header === "Email Address") payload.submitter_email = value;
      if (header === "FULL NAME") payload.full_name = value;
      if (header === "CONTACT") payload.contact = normalizeContact(value) || value;
      if (header === "PLACE OF RESIDENCE") payload.place_of_residence = value;
      if (header === "WHO INVITED YOU?(FULL NAME)") payload.invited_by = value;
      if (header === "NAME OF CELL") payload.cell_name = value;
      if (header === "JOINING OR VISITING") payload.visit_type = normalizeVisitType(value);
    });

    if (!payload.full_name) {
      errors.push("Skipped a row with no full name.");
      continue;
    }

    const key = `${normalizeText(String(payload.full_name)).toLowerCase()}::${normalizeContact(
      String(payload.contact || "")
    )}`;
    const existing = existingByKey.get(key);

    if (!existing) {
      const assignedCallerId = await getLeastLoadedCaller(integration.branch_id);
      if (assignedCallerId) {
        payload.assigned_caller_id = assignedCallerId;
      }

      const { error } = await adminClient.from("first_timers").insert(payload);
      if (error) {
        errors.push(error.message);
      } else {
        inserted++;
      }
      continue;
    }

    const { error } = await adminClient
      .from("first_timers")
      .update(payload)
      .eq("id", existing.id)
      .eq("branch_id", integration.branch_id);

    if (error) {
      errors.push(error.message);
    } else {
      updated++;
    }
  }

  const assignmentResult = await assignAllUnassignedFirstTimers(integration.branch_id);

  await adminClient
    .from("branch_integrations")
    .update({
      last_synced_at: new Date().toISOString(),
      last_success_at: new Date().toISOString(),
      last_error: errors[0] || null,
    })
    .eq("id", integration.id);

  return {
    branchId: integration.branch_id,
    inserted,
    updated,
    autoAssigned: assignmentResult.assigned,
    errors,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const requestedBranchId =
      typeof body?.branchId === "string" && body.branchId.trim()
        ? body.branchId
        : null;

    const integrations = await resolveIntegrations(request, requestedBranchId);
    if (integrations.length === 0) {
      return NextResponse.json(
        {
          message: "No active first timer integrations found.",
          count: 0,
          updated: 0,
          autoAssigned: 0,
        },
        { status: 404 }
      );
    }

    const sheets = await getSheetsClient();
    const results = await Promise.all(
      integrations.map((integration) => syncSingleBranch(integration, sheets))
    );

    return NextResponse.json({
      message: "First timer sync completed.",
      count: results.reduce((sum, item) => sum + item.inserted, 0),
      updated: results.reduce((sum, item) => sum + item.updated, 0),
      autoAssigned: results.reduce((sum, item) => sum + item.autoAssigned, 0),
      branchResults: results,
      errors: results.flatMap((item) => item.errors).slice(0, 10),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}
