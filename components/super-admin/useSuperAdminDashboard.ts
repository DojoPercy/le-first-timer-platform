"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { PlatformSummaryResponse } from "@/lib/super-admin/platform-summary-types";

export function useSuperAdminDashboard() {
  const [data, setData] = useState<PlatformSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);
  const [targetInput, setTargetInput] = useState("");
  const [isSavingTarget, setIsSavingTarget] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/superadmin/summary", { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load platform summary");
      }

      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load platform summary");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  const handleSetTarget = async () => {
    const target = parseInt(targetInput, 10);

    if (Number.isNaN(target) || target <= 0) {
      return void toast.error("Please enter a valid positive number");
    }

    setIsSavingTarget(true);
    try {
      const response = await fetch("/api/superadmin/platform-target", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to update platform target");
      }

      toast.success("Platform target updated successfully");
      setIsTargetDialogOpen(false);
      setTargetInput("");
      await fetchSummary();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update platform target");
    } finally {
      setIsSavingTarget(false);
    }
  };

  return {
    data,
    error,
    isLoading,
    isSavingTarget,
    isTargetDialogOpen,
    targetInput,
    setIsTargetDialogOpen,
    setTargetInput,
    handleSetTarget,
    fetchSummary,
  };
}
