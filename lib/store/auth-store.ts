import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { resetCachedBranchId } from "@/lib/auth/client-branch";

type UserRole = "super_admin" | "admin" | "caller" | null;

interface AuthStore {
  email: string;
  user: { id: string; email: string } | null;
  role: UserRole;
  isLoading: boolean;
  error: string | null;
  setEmail: (email: string) => void;
  login: (password: string) => Promise<void>;
  fetchCaller: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => {
  const supabase = createClient();
  return {
    email: "",
    user: null,
    role: null,
    isLoading: false,
    error: null,
    setEmail: (email) => set({ email }),
    login: async (password) => {
      set({ isLoading: true, error: null });
      const { email } = get();
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        set({ error: payload?.message || "Failed to sign in", isLoading: false });
        return;
      }
      resetCachedBranchId();
      set({ role: payload?.role || null, isLoading: false });
      window.location.href = payload?.redirectTo || "/";
    },
    fetchCaller: async () => {
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.authenticated || !payload?.role) {
        set({ error: "Caller not found" });
        return;
      }
      set({ role: payload.role });
      if (payload.role === "super_admin") {
        window.location.href = "/superadmin/dashboard";
      } else if (payload.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/caller";
      }
    },
    logout: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      resetCachedBranchId();
      set({ email: "", user: null, role: null });
      toast.success("Signed out successfully");
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    },
  };
});
