import { useEffect, useState } from "react";
import { useFollowupStore } from "@/lib/store/followup-store";
import { createClient } from "@/lib/supabase/client";
import type { Followup, Soul, Caller } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

export function useMyFollowupsTable(callerId: string) {
  const { followups, fetchFollowups, isLoading } = useFollowupStore();
  const [souls, setSouls] = useState<Map<string, Soul>>(new Map());
  const [caller, setCaller] = useState<Caller | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFollowup, setSelectedFollowup] = useState<Followup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (callerId) {
      fetchFollowups({ callerId });
    }
  }, [callerId, fetchFollowups]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        
        // Fetch souls
        const { data: soulsData } = await supabase
          .from("souls")
          .select("*");

        const soulMap = new Map<string, Soul>();
        soulsData?.forEach((s: Soul) => soulMap.set(s.id, s));
        setSouls(soulMap);

        // Fetch caller
        if (callerId) {
          const { data: callerData } = await supabase
            .from("callers")
            .select("*")
            .eq("id", callerId)
            .single();
          
          setCaller(callerData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [callerId]);


  const filteredFollowups = followups.filter((followup: Followup) => {
    const matchesSearch =
      (souls.get(followup.soul_id)?.full_name || "")
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


  return {
    followups: paginatedFollowups,
    souls,
    caller,
    isLoading,
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
    fetchFollowups,
  };
}
