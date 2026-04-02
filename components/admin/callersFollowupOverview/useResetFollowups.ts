import { useState } from "react";
import { toast } from "sonner";

export function useResetFollowups(onSuccess: () => void) {
  const [resetting, setResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleResetFollowups = async () => {
    setResetting(true);
    toast.loading("Resetting all follow-ups...", { id: "reset-followups" });
    try {
      const res = await fetch("/api/admin/reset-followups", {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.deleted > 0) {
        toast.success(
          `${data.deleted} follow-up${data.deleted > 1 ? "s" : ""} deleted`,
          { id: "reset-followups" }
        );
      } else {
        toast.info("No follow-ups to delete", { id: "reset-followups" });
      }

      // Refresh stats
      await onSuccess();
    } catch (err) {
      console.error("Reset failed:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error";
      toast.error(`Reset failed: ${errorMessage}`, { id: "reset-followups" });
    } finally {
      setResetting(false);
      setResetDialogOpen(false);
    }
  };

  return {
    resetting,
    resetDialogOpen,
    setResetDialogOpen,
    handleResetFollowups,
  };
}
