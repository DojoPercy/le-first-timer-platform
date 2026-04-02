import { Branch, BranchIntegration } from "@/lib/types";

export interface BranchAdminSummary {
  id: string;
  name: string;
  email: string;
}

export interface BranchWithRelations extends Branch {
  integrations?: BranchIntegration[];
  callers_count?: number;
  souls_count?: number;
  branch_admin?: BranchAdminSummary | null;
}

export interface BranchesResponse {
  branches: BranchWithRelations[];
}

export type BranchFormState = {
  branchName: string;
  branchCode: string;
  branchDescription: string;
  branchStatus: "active" | "inactive";
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  soulsSheetId: string;
  soulsSheetRange: string;
  soulsFormUrl: string;
  soulsStatus: "active" | "paused" | "error";
  mcSheetId: string;
  mcSheetRange: string;
  mcFormUrl: string;
  mcStatus: "active" | "paused" | "error";
};

export const emptyBranchForm: BranchFormState = {
  branchName: "",
  branchCode: "",
  branchDescription: "",
  branchStatus: "active",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
  soulsSheetId: "",
  soulsSheetRange: "",
  soulsFormUrl: "",
  soulsStatus: "active",
  mcSheetId: "",
  mcSheetRange: "",
  mcFormUrl: "",
  mcStatus: "active",
};

export function getIntegration(
  branch: BranchWithRelations | null,
  type: BranchIntegration["integration_type"],
) {
  return branch?.integrations?.find((integration) => integration.integration_type === type) || null;
}

export function buildFormFromBranch(branch: BranchWithRelations): BranchFormState {
  const soulsIntegration = getIntegration(branch, "souls_intake");
  const mcIntegration = getIntegration(branch, "mc_evangelism");

  return {
    branchName: branch.name,
    branchCode: branch.code || "",
    branchDescription: branch.description || "",
    branchStatus: branch.status,
    adminName: branch.branch_admin?.name || "",
    adminEmail: branch.branch_admin?.email || "",
    adminPassword: "",
    soulsSheetId: soulsIntegration?.sheet_id || "",
    soulsSheetRange: soulsIntegration?.sheet_range || "",
    soulsFormUrl: soulsIntegration?.form_url || "",
    soulsStatus: soulsIntegration?.status || "active",
    mcSheetId: mcIntegration?.sheet_id || "",
    mcSheetRange: mcIntegration?.sheet_range || "",
    mcFormUrl: mcIntegration?.form_url || "",
    mcStatus: mcIntegration?.status || "active",
  };
}

export function formatTimestamp(value?: string | null) {
  if (!value) {
    return "Not synced yet";
  }

  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function statusBadgeClass(status: string) {
  if (status === "active") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "paused") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "error") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-100 text-slate-700";
}
