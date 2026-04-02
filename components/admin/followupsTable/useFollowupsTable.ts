import { useEffect, useState } from "react";
import { getCurrentBranchId } from "@/lib/auth/client-branch";
import { useFollowupStore } from "@/lib/store/followup-store";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Followup, Soul, Caller } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

export function useFollowupsTable() {
  const { followups, fetchFollowups, isLoading, deleteFollowup } =
    useFollowupStore();
  const [souls, setSouls] = useState<Map<string, Soul>>(new Map());
  const [callers, setCallers] = useState<Map<string, Caller>>(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFollowup, setSelectedFollowup] = useState<Followup | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [followupToDelete, setFollowupToDelete] = useState<Followup | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  useEffect(() => {
    const fetchRelations = async () => {
      try {
        const supabase = createClient();
        const branchId = await getCurrentBranchId();

        if (!branchId) {
          setSouls(new Map());
          setCallers(new Map());
          return;
        }

        const { data: soulsData } = await supabase
          .from("souls")
          .select("*")
          .eq("branch_id", branchId);
        const { data: callersData } = await supabase
          .from("callers")
          .select("*")
          .eq("branch_id", branchId)
          .neq("role", "super_admin");

        const soulMap = new Map<string, Soul>();
        const callerMap = new Map<string, Caller>();

        soulsData?.forEach((s: Soul) => soulMap.set(s.id, s));
        callersData?.forEach((c: Caller) => callerMap.set(c.id, c));

        setSouls(soulMap);
        setCallers(callerMap);
      } catch (error) {
        console.error("Failed to fetch relations:", error);
      }
    };

    fetchRelations();
  }, []);


  const filteredFollowups = followups.filter((followup: Followup) => {
    const matchesSearch =
      (souls.get(followup.soul_id)?.full_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (callers.get(followup.caller_id)?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (followup.notes || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || followup.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredFollowups.length / ITEMS_PER_PAGE);
  const paginatedFollowups = filteredFollowups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  const handleDeleteClick = (followup: Followup) => {
    setFollowupToDelete(followup);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!followupToDelete) return;

    setIsDeleting(true);
    try {
      await deleteFollowup(followupToDelete.id);
      toast.success("Follow-up deleted successfully");
      setDeleteDialogOpen(false);
      fetchFollowups();
    } catch (error) {
      toast.error("Failed to delete follow-up");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
      setFollowupToDelete(null);
    }
  };

  const handleResetFollowups = async () => {
    setResetting(true);
    toast.loading("Resetting all follow-ups...", { id: "reset-followups" });
    try {
      const res = await fetch("/api/admin/reset-followups", { method: "POST" });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.deletedCount > 0) {
        toast.success(
          `${data.deletedCount} follow-up${
            data.deletedCount > 1 ? "s" : ""
          } deleted successfully`,
          { id: "reset-followups" }
        );
      } else {
        toast.info("No follow-ups to delete", { id: "reset-followups" });
      }

      setResetDialogOpen(false);
      fetchFollowups();
    } catch (err) {
      console.error("Reset failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Reset failed: ${errorMessage}`, { id: "reset-followups" });
    } finally {
      setResetting(false);
    }
  };

  return {
    followups: paginatedFollowups,
    isLoading,
    souls,
    callers,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredFollowupsCount: filteredFollowups.length,
    selectedFollowup,
    setSelectedFollowup,
    isDialogOpen,
    setIsDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    followupToDelete,
    isDeleting,
    resetting,
    resetDialogOpen,
    setResetDialogOpen,
    handleDeleteClick,
    confirmDelete,
    handleResetFollowups,
    fetchFollowups,
  };
}
