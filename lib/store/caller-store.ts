import { create } from "zustand";
import { getCurrentBranchId } from "@/lib/auth/client-branch";
import { createClient } from "@/lib/supabase/client";
import type { Caller } from "@/lib/types";

interface CallerStore {
  callers: Caller[];
  currentCaller: Caller | null;
  isLoading: boolean;
  fetchCallers: () => Promise<void>;
  fetchCurrentCaller: (userId: string) => Promise<void>;
  getMyFirstTimers: (callerId: string) => Promise<any[]>;
  deleteUser: (id: string) => Promise<void>;
  updateProfile: (
    callerId: string,
    payload: Partial<Pick<Caller, "name" | "email" | "role" | "avatar_url">>
  ) => Promise<void>;
  uploadAvatar: (callerId: string, userId: string, file: File) => Promise<void>;
  removeAvatar: (callerId: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

export const useCallerStore = create<CallerStore>((set, get) => ({
  callers: [],
  currentCaller: null,
  isLoading: false,

  fetchCallers: async () => {
    set({ isLoading: true });
    try {
      const supabase = createClient();
      const branchId = await getCurrentBranchId();

      if (!branchId) {
        set({ callers: [] });
        return;
      }

      const { data, error } = await supabase
        .from("callers")
        .select("*")
        .eq("branch_id", branchId)
        .neq("role", "super_admin");
      if (error) throw error;

      set({ callers: data || [] });
    } catch (error) {
      console.error("Failed to fetch callers:", error);
      set({ callers: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCurrentCaller: async (userId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("callers")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error && error.code !== "PGRST116") throw error;

      set({ currentCaller: data || null });
    } catch (error) {
      console.error("Failed to fetch current caller:", error);
      set({ currentCaller: null });
    }
  },

  getMyFirstTimers: async (callerId: string) => {
    try {
      const supabase = createClient();
      const branchId = await getCurrentBranchId();
      const { data, error } = await supabase
        .from("first_timers")
        .select("*")
        .eq("assigned_caller_id", callerId)
        .eq("branch_id", branchId)
        .order("updated_at", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Failed to fetch caller first timers:", error);
      return [];
    }
  },

  updateProfile: async (callerId: string, payload) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("callers").update(payload).eq("id", callerId);
      if (error) throw error;

      const { data: updated, error: fetchError } = await supabase
        .from("callers")
        .select("*")
        .eq("id", callerId)
        .single();
      if (fetchError) throw fetchError;
      set({ currentCaller: updated || null });
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  },

  uploadAvatar: async (callerId: string, userId: string, file: File) => {
    try {
      const supabase = createClient();

      const { data: caller, error: fetchError } = await supabase
        .from("callers")
        .select("avatar_url")
        .eq("id", callerId)
        .single();
      if (fetchError) throw fetchError;

      if (caller?.avatar_url) {
        const oldPath = caller.avatar_url.split("/avatars/")[1];
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("callers")
        .update({ avatar_url: publicUrl })
        .eq("id", callerId);
      if (updateError) throw updateError;

      const { data: updated, error: updatedError } = await supabase
        .from("callers")
        .select("*")
        .eq("id", callerId)
        .single();
      if (updatedError) throw updatedError;
      set({ currentCaller: updated || null });
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      throw error;
    }
  },

  removeAvatar: async (callerId: string) => {
    try {
      const supabase = createClient();
      const { data: caller, error: fetchError } = await supabase
        .from("callers")
        .select("avatar_url")
        .eq("id", callerId)
        .single();
      if (fetchError) throw fetchError;
      if (caller?.avatar_url) {
        const oldPath = caller.avatar_url.split("/avatars/")[1];
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }
      const { error: updateError } = await supabase
        .from("callers")
        .update({ avatar_url: null })
        .eq("id", callerId);
      if (updateError) throw updateError;
      const { data: updated, error: updatedError } = await supabase
        .from("callers")
        .select("*")
        .eq("id", callerId)
        .single();
      if (updatedError) throw updatedError;
      set({ currentCaller: updated || null });
    } catch (error) {
      console.error("Failed to remove avatar:", error);
      throw error;
    }
  },

  updatePassword: async (password: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    } catch (error) {
      console.error("Failed to update password:", error);
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    try {
      const supabase = createClient();
      const { data: user, error: fetchError } = await supabase
        .from("callers")
        .select("user_id, email, role")
        .eq("id", id)
        .single();
      if (fetchError || !user) throw fetchError || new Error("User not found");

      const res = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, user_id: user.user_id, role: user.role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete user");
      }

      set((state) => ({
        callers: state.callers.filter((c) => c.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  },
}));
