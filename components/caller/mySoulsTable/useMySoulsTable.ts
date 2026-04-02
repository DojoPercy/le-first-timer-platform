import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCallerStore } from "@/lib/store/caller-store";
import type { Soul, Followup } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

export function useMySoulsTable(callerId: string) {
  const supabase = createClient();
  const { callers, fetchCallers } = useCallerStore();
  const [souls, setSouls] = useState<Soul[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSoul, setSelectedSoul] = useState<Soul | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCallers();
  }, [fetchCallers]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [soulsRes, followupsRes] = await Promise.all([
          supabase
            .from("souls")
            .select("*")
            .eq("assigned_caller_id", callerId),
          supabase
            .from("followups")
            .select("*")
            .eq("caller_id", callerId),
        ]);

        if (soulsRes.error) throw soulsRes.error;
        if (followupsRes.error) throw followupsRes.error;

        setSouls(soulsRes.data || []);
        setFollowups(followupsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setSouls([]);
        setFollowups([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time changes
    const soulsSub = supabase
      .channel("caller-souls-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "souls", filter: `assigned_caller_id=eq.${callerId}` },
        () => fetchData()
      )
      .subscribe();

    const followupsSub = supabase
      .channel("caller-followups-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "followups", filter: `caller_id=eq.${callerId}` },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(soulsSub);
      supabase.removeChannel(followupsSub);
    };
  }, [callerId, supabase]);

  const totalPages = Math.ceil(souls.length / ITEMS_PER_PAGE);
  const paginatedSouls = souls.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return {
    souls,
    paginatedSouls,
    followups,
    isLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    selectedSoul,
    setSelectedSoul,
    isDialogOpen,
    setIsDialogOpen,
    callers,
  };
}
