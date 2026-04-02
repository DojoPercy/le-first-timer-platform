import type { Caller } from "@/lib/types";

export interface CallerFollowupStats {
  caller: Caller;
  assignedSouls: number;
  totalFollowupsMade: number;
  totalFollowupsNeeded: number;
  percentage: number;
}
