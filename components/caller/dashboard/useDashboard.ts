import { useEffect, useState, ChangeEvent } from "react";
import { useSoulStore } from "@/lib/store/soul-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { createClient } from "@/lib/supabase/client";
import type { Soul } from "@/lib/types";

interface ProgressMap {
  [soulId: string]: number;
}

export function useDashboard() {
  const { user } = useAuthStore();
  const { souls, fetchSouls } = useSoulStore();
  const [assignedSouls, setAssignedSouls] = useState<Soul[]>([]);
  const [selectedSoul, setSelectedSoul] = useState<Soul | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [followupNote, setFollowupNote] = useState("");
  const [progress, setProgress] = useState<ProgressMap>({});
  const supabase = createClient();

  useEffect(() => {
    if (user?.id) {
      fetchSouls({ assignedCallerId: user.id });
    }
  }, [user, fetchSouls]);

  useEffect(() => {
    setAssignedSouls(souls);
  }, [souls]);

  useEffect(() => {
    // Realtime updates for followups
    const followupsSub = supabase
      .channel("caller-followups")
      .on("postgres_changes", { event: "*", schema: "public", table: "followups" }, () => {
        if (user?.id) fetchSouls({ assignedCallerId: user.id });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(followupsSub);
    };
  }, [user, fetchSouls, supabase]);

  const handleFollowupClick = (soul: Soul) => {
    // Only allow if less than 4 followups
    if (progress[soul.id] && progress[soul.id] >= 4) return;
    setSelectedSoul(soul);
    setShowModal(true);
  };

  const handleFollowupSubmit = async () => {
    if (!selectedSoul || !user?.id) return;
    // Check if already 4 followups
    const { data: followups } = await supabase
      .from("followups")
      .select("id")
      .eq("soul_id", selectedSoul.id)
      .eq("caller_id", user.id);
    if ((followups?.length || 0) >= 4) {
      setShowModal(false);
      setFollowupNote("");
      return;
    }
    await supabase.from("followups").insert({
      soul_id: selectedSoul.id,
      caller_id: user.id,
      note: followupNote,
      completed: false,
    });
    setShowModal(false);
    setFollowupNote("");
    // Update progress
    const soulFollowups = await supabase
      .from("followups")
      .select("*")
      .eq("soul_id", selectedSoul.id)
      .eq("caller_id", user.id);
    setProgress((prev: ProgressMap) => ({ ...prev, [selectedSoul.id]: soulFollowups.data?.length || 0 }));
  };

  const handleNoteChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFollowupNote(e.target.value);
  };

  return {
    assignedSouls,
    selectedSoul,
    showModal,
    setShowModal,
    followupNote,
    progress,
    handleFollowupClick,
    handleFollowupSubmit,
    handleNoteChange,
  };
}
