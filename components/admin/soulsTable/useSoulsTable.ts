import { useEffect, useState } from "react";
import { useSoulStore } from "@/lib/store/soul-store";
import { useCallerStore } from "@/lib/store/caller-store";
import type { Soul } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

export function useSoulsTable() {
  const { souls, fetchSouls, isLoading, updateSoul } = useSoulStore();
  const { callers, fetchCallers } = useCallerStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSouls, setFilteredSouls] = useState<Soul[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSoul, setSelectedSoul] = useState<Soul | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchSouls();
    fetchCallers();
  }, [fetchSouls, fetchCallers]);

  useEffect(() => {
    const filtered = souls.filter(
      (soul: Soul) =>
        soul.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        soul.phone?.includes(searchTerm)
    );
    setFilteredSouls(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [souls, searchTerm]);

  const handleAssignCaller = async (soulId: string, callerId: string) => {
    await updateSoul(soulId, { assigned_caller_id: callerId });
  };

  const handleViewDetails = (soul: Soul) => {
    setSelectedSoul(soul);
    setIsDialogOpen(true);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredSouls.length / ITEMS_PER_PAGE);
  const paginatedSouls = filteredSouls.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return {
    souls: paginatedSouls,
    callers,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredSoulsCount: filteredSouls.length,
    selectedSoul,
    isDialogOpen,
    setIsDialogOpen,
    handleAssignCaller,
    handleViewDetails,
  };
}
