import { create } from "zustand";
import { getCurrentBranchId } from "@/lib/auth/client-branch";
import { createClient } from "@/lib/supabase/client";
import type { Followup } from "@/lib/types";

interface FollowupStore {
  followups: Followup[];
  isLoading: boolean;
  fetchFollowups: (filters?: {
    firstTimerId?: string;
    callerId?: string;
  }) => Promise<void>;
  addFollowup: (
    followup: Omit<Followup, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateFollowup: (id: string, data: Partial<Followup>) => Promise<void>;
  deleteFollowup: (id: string) => Promise<void>;
}

export const useFollowupStore = create<FollowupStore>((set) => ({
  followups: [],
  isLoading: false,

  fetchFollowups: async (filters) => {
    set({ isLoading: true });
    try {
      const supabase = createClient();
      const branchId = await getCurrentBranchId();

      if (!branchId) {
        set({ followups: [] });
        return;
      }

      let query = supabase
        .from("followups")
        .select("*")
        .eq("branch_id", branchId)
        .order("date", { ascending: false });

      if (filters?.firstTimerId) {
        query = query.eq("first_timer_id", filters.firstTimerId);
      }
      if (filters?.callerId) {
        query = query.eq("caller_id", filters.callerId);
      }

      const { data, error } = await query;
      if (error) throw error;

      set({ followups: data || [] });
    } catch (error) {
      console.error("Failed to fetch followups:", error);
      set({ followups: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addFollowup: async (followup) => {
    try {
      const supabase = createClient();
      const branchId = await getCurrentBranchId();

      if (!branchId) {
        throw new Error("No branch scope found for this account");
      }

      const payload = { ...followup, branch_id: branchId };
      const { data: newFollowup, error } = await supabase
        .from("followups")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;

      const followupDate = payload.date || new Date().toISOString();
      const { error: updateError } = await supabase
        .from("first_timers")
        .update({ last_followup_at: followupDate })
        .eq("id", followup.first_timer_id)
        .eq("branch_id", branchId);

      if (updateError) {
        console.warn(
          "Failed to update first timer's last_followup_at:",
          updateError
        );
      }

      set((state) => ({
        followups: [newFollowup, ...state.followups],
      }));
    } catch (error) {
      console.error("Failed to add followup:", error);
      throw error;
    }
  },

  updateFollowup: async (id, data) => {
    try {
      const supabase = createClient();
      const branchId = await getCurrentBranchId();
      let query = supabase.from("followups").update(data).eq("id", id);

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data: updatedFollowup, error } = await query.select().single();
      if (error) throw error;

      if (data.date && updatedFollowup) {
        const { error: updateError } = await supabase
          .from("first_timers")
          .update({ last_followup_at: data.date })
          .eq("id", updatedFollowup.first_timer_id)
          .eq("branch_id", branchId);

        if (updateError) {
          console.warn(
            "Failed to update first timer's last_followup_at after follow-up update:",
            updateError
          );
        }
      }

      set((state) => ({
        followups: state.followups.map((f) =>
          f.id === id ? { ...f, ...data } : f
        ),
      }));
    } catch (error) {
      console.error("Failed to update followup:", error);
      throw error;
    }
  },

  deleteFollowup: async (id) => {
    try {
      const supabase = createClient();
      const branchId = await getCurrentBranchId();

      let fetchQuery = supabase
        .from("followups")
        .select("first_timer_id, date")
        .eq("id", id);
      if (branchId) {
        fetchQuery = fetchQuery.eq("branch_id", branchId);
      }
      const { data: followupToDelete, error: fetchError } =
        await fetchQuery.single();

      if (fetchError) throw fetchError;

      let deleteQuery = supabase.from("followups").delete().eq("id", id);
      if (branchId) {
        deleteQuery = deleteQuery.eq("branch_id", branchId);
      }
      const { error: deleteError } = await deleteQuery;

      if (deleteError) throw deleteError;

      if (followupToDelete) {
        const { data: remainingFollowups } = await supabase
          .from("followups")
          .select("date")
          .eq("first_timer_id", followupToDelete.first_timer_id)
          .eq("branch_id", branchId)
          .order("date", { ascending: false })
          .limit(1);

        const newLastFollowupAt =
          remainingFollowups && remainingFollowups.length > 0
            ? remainingFollowups[0].date
            : null;

        const { error: updateError } = await supabase
          .from("first_timers")
          .update({ last_followup_at: newLastFollowupAt })
          .eq("id", followupToDelete.first_timer_id)
          .eq("branch_id", branchId);

        if (updateError) {
          console.warn(
            "Failed to update first timer's last_followup_at after deletion:",
            updateError
          );
        }
      }

      set((state) => ({
        followups: state.followups.filter((f) => f.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete followup:", error);
      throw error;
    }
  },
}));
