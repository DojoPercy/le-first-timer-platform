import type { BranchFormState, BranchesResponse } from "@/components/super-admin/branch-management";

type BranchPayload = {
  branch: {
    name: string;
    code: string | null;
    description: string | null;
    status?: "active" | "inactive";
  };
  admin: {
    name?: string;
    email?: string;
    password?: string;
  };
  integrations: Array<{
    integrationType: "souls_intake" | "mc_evangelism";
    sheetId: string;
    sheetRange: string | null;
    formUrl: string | null;
    status: "active" | "paused" | "error";
  }>;
};

async function requestJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload as T;
}

export function buildBranchPayload(form: BranchFormState, includeStatus = false): BranchPayload {
  const integrations: BranchPayload["integrations"] = [
    {
      integrationType: "souls_intake",
      sheetId: form.soulsSheetId.trim(),
      sheetRange: form.soulsSheetRange.trim() || null,
      formUrl: form.soulsFormUrl.trim() || null,
      status: form.soulsStatus,
    },
  ];

  if (form.mcSheetId.trim()) {
    integrations.push({
      integrationType: "mc_evangelism",
      sheetId: form.mcSheetId.trim(),
      sheetRange: form.mcSheetRange.trim() || null,
      formUrl: form.mcFormUrl.trim() || null,
      status: form.mcStatus,
    });
  }

  return {
    branch: {
      name: form.branchName.trim(),
      code: form.branchCode.trim() || null,
      description: form.branchDescription.trim() || null,
      ...(includeStatus ? { status: form.branchStatus } : {}),
    },
    admin: {
      name: form.adminName.trim() || undefined,
      email: form.adminEmail.trim() || undefined,
      password: form.adminPassword || undefined,
    },
    integrations,
  };
}

export async function fetchBranchesRequest() {
  const payload = await requestJson<BranchesResponse>("/api/superadmin/branches", {
    cache: "no-store",
  } as RequestInit);
  return payload.branches || [];
}

export async function createBranchRequest(form: BranchFormState) {
  return requestJson<{ message?: string }>("/api/superadmin/branches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildBranchPayload(form)),
  });
}

export async function updateBranchRequest(branchId: string, form: BranchFormState) {
  return requestJson<{ message?: string }>(`/api/superadmin/branches/${branchId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildBranchPayload(form, true)),
  });
}

export async function deleteBranchRequest(branchId: string) {
  return requestJson<{ message?: string }>(`/api/superadmin/branches/${branchId}`, {
    method: "DELETE",
  });
}

export async function seedAlphaIntegrationsRequest() {
  return requestJson<{ message?: string }>("/api/superadmin/seed-alpha-integrations", {
    method: "POST",
  });
}
