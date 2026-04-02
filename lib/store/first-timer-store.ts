import { create } from "zustand";
import { getCurrentBranchId } from "@/lib/auth/client-branch";
import { createClient } from "@/lib/supabase/client";
import type { FirstTimer } from "@/lib/types";

interface FirstTimerStore {
  firstTimers: FirstTimer[];
  isLoading: boolean;
  selectedFirstTimer: FirstTimer | null;
  setSelectedFirstTimer: (firstTimer: FirstTimer | null) => void;
  fetchFirstTimers: (filters?: { assignedCallerId?: string }) => Promise<void>;
  updateFirstTimer: (id: string, data: Partial<FirstTimer>) => Promise<void>;
  updateFollowupOutcome: (
    id: string,
    status: NonNullable<FirstTimer["followup_outcome_status"]>
  ) => Promise<void>;
  assignFirstTimer: (firstTimerId: string, callerId: string) => Promise<void>;
  addFirstTimer: (
    firstTimer: Omit<FirstTimer, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
}

export const useFirstTimerStore = create<FirstTimerStore>((set, get) => ({
  firstTimers: [],
  isLoading: false,
  selectedFirstTimer: null,

  setSelectedFirstTimer: (firstTimer) => set({ selectedFirstTimer: firstTimer }),

  fetchFirstTimers: async (filters) => {
    set({ isLoading: true });
    try {
      const supabase = createClient();
      const branchId = await getCurrentBranchId();

      if (!branchId) {
        set({ firstTimers: [] });
        return;
      }

      let query = supabase
        .from("first_timers")
        .select("*")
        .eq("branch_id", branchId)
        .order("updated_at", { ascending: false })
        .order("created_at", { ascending: false });

      if (filters?.assignedCallerId) {
        query = query.eq("assigned_caller_id", filters.assignedCallerId);
      }

      const { data, error } = await query;
      if (error) throw error;

      set({ firstTimers: data || [] });
    } catch (error) {
      console.error("Failed to fetch first timers:", error);
      set({ firstTimers: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  updateFirstTimer: async (id, data) => {
    try {
      const supabase = createClient();
      const branchId = await getCurrentBranchId();
      let query = supabase.from("first_timers").update(data).eq("id", id);

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { error } = await query;
      if (error) throw error;

      set((state) => ({
        firstTimers: state.firstTimers
          .map((ft) =>
            ft.id === id ? { ...ft, ...data, updated_at: new Date().toISOString() } : ft
          )
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          ),
      }));
    } catch (error) {
      console.error("Failed to update first timer:", error);
    }
  },

  updateFollowupOutcome: async (id, status) => {
    const timestamp = new Date().toISOString();
    await get().updateFirstTimer(id, {
      followup_outcome_status: status,
      joined_confirmed_at: status === "fully_joined" ? timestamp : null,
      outcome_updated_at: timestamp,
    });
  },

  assignFirstTimer: async (firstTimerId, callerId) => {
    await get().updateFirstTimer(firstTimerId, { assigned_caller_id: callerId });
  },

  addFirstTimer: async (firstTimer) => {
    try {
      const supabase = createClient();
      const branchId = await getCurrentBranchId();

      if (!branchId) {
        throw new Error("No branch scope found for this account");
      }

      const { data, error } = await supabase
        .from("first_timers")
        .insert([{ ...firstTimer, branch_id: branchId }])
        .select()
        .single();
      if (error) throw error;

      set((state) => ({
        firstTimers: [data, ...state.firstTimers].sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        ),
      }));
    } catch (error) {
      console.error("Failed to add first timer:", error);
    }
  },
}));
