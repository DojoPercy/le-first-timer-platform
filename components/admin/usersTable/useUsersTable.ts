import { useEffect, useState } from "react";
import { getCurrentBranchId } from "@/lib/auth/client-branch";
import { useCallerStore } from "@/lib/store/caller-store";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export function useUsersTable() {
  const { callers, fetchCallers, deleteUser, isLoading } = useCallerStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [soulCounts, setSoulCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCallers();
  }, [fetchCallers]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const fetchSoulCounts = async () => {
      if (callers.length === 0) return;

      setLoadingCounts(true);
      const supabase = createClient();
      const branchId = await getCurrentBranchId();
      const counts: Record<string, number> = {};

      try {
        if (!branchId) {
          setSoulCounts({});
          return;
        }

        const { data: souls } = await supabase
          .from("souls")
          .select("assigned_caller_id")
          .eq("branch_id", branchId);

        souls?.forEach((soul: { assigned_caller_id: string | null }) => {
          if (soul.assigned_caller_id) {
            counts[soul.assigned_caller_id] =
              (counts[soul.assigned_caller_id] || 0) + 1;
          }
        });

        setSoulCounts(counts);
      } catch (error) {
        console.error("Failed to fetch soul counts:", error);
      } finally {
        setLoadingCounts(false);
      }
    };

    if (callers.length > 0) {
      fetchSoulCounts();
    }
  }, [callers]);

  const filteredUsers = callers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDeleteClick = (id: string, name: string) => {
    setUserToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      toast.success(`User ${userToDelete.name} deleted successfully`);
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  return {
    users: paginatedUsers,
    isLoading,
    isHydrated,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredUsersCount: filteredUsers.length,
    soulCounts,
    loadingCounts,
    deleteDialogOpen,
    setDeleteDialogOpen,
    userToDelete,
    isDeleting,
    handleDeleteClick,
    confirmDelete,
    fetchCallers,
  };
}
