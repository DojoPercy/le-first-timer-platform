export interface Caller {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: string;
  branch_id?: string | null;
  active_month?: string;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  status: "active" | "inactive";
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BranchIntegration {
  id: string;
  branch_id: string;
  integration_type: "first_timer_intake";
  provider: string;
  sheet_id: string;
  sheet_range?: string | null;
  form_url?: string | null;
  status: "active" | "paused" | "error";
  template_version: number;
  last_synced_at?: string | null;
  last_success_at?: string | null;
  last_error?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FirstTimer {
  id: string;
  full_name: string;
  form_submitted_at?: string | null;
  submitter_email?: string;
  contact?: string;
  place_of_residence?: string;
  invited_by?: string;
  cell_name?: string;
  visit_type?: string; // JOINING | VISITING | JOINING, VISITING
  followup_outcome_status?:
    | "pending"
    | "still_deciding"
    | "fully_joined"
    | "not_continuing";
  joined_confirmed_at?: string | null;
  outcome_updated_at?: string | null;
  branch_id?: string;
  assigned_caller_id?: string;
  last_followup_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Followup {
  id: string;
  first_timer_id: string;
  caller_id: string;
  branch_id?: string;
  date: string;
  notes?: string;
  status: "Contacted" | "Pending" | "Not Reachable";
  created_at: string;
  updated_at: string;
}

export interface CellStat {
  cell: string;
  count: number;
  total: number;
}

export interface InviterStat {
  inviter: string;
  invitedCount: number;
  fullyJoinedCount: number;
  stillDecidingCount: number;
  notContinuingCount: number;
  pendingCount: number;
  conversionRate: number;
}

export type UserRole = "super_admin" | "admin" | "caller" | null;
