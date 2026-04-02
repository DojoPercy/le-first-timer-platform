import type { FirstTimer, InviterStat } from "@/lib/types";

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeInviterName(value?: string | null) {
  if (!value) return null;
  const normalized = normalizeWhitespace(value).toLowerCase();
  return normalized || null;
}

function formatInviterName(value: string) {
  return normalizeWhitespace(value)
    .split(" ")
    .map((part) =>
      part ? `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}` : part
    )
    .join(" ");
}

export function buildInviterStats(firstTimers: FirstTimer[], limit = 10): InviterStat[] {
  const inviterMap = new Map<
    string,
    {
      inviter: string;
      invitedCount: number;
      fullyJoinedCount: number;
      stillDecidingCount: number;
      notContinuingCount: number;
      pendingCount: number;
    }
  >();

  for (const firstTimer of firstTimers) {
    const key = normalizeInviterName(firstTimer.invited_by);
    if (!key) continue;

    const existing = inviterMap.get(key) || {
      inviter: formatInviterName(firstTimer.invited_by || "Unknown"),
      invitedCount: 0,
      fullyJoinedCount: 0,
      stillDecidingCount: 0,
      notContinuingCount: 0,
      pendingCount: 0,
    };

    existing.invitedCount += 1;

    if (firstTimer.followup_outcome_status === "fully_joined") {
      existing.fullyJoinedCount += 1;
    } else if (firstTimer.followup_outcome_status === "still_deciding") {
      existing.stillDecidingCount += 1;
    } else if (firstTimer.followup_outcome_status === "not_continuing") {
      existing.notContinuingCount += 1;
    } else {
      existing.pendingCount += 1;
    }

    inviterMap.set(key, existing);
  }

  return Array.from(inviterMap.values())
    .map((item) => ({
      ...item,
      conversionRate:
        item.invitedCount > 0
          ? Math.round((item.fullyJoinedCount / item.invitedCount) * 100)
          : 0,
    }))
    .sort((a, b) => {
      if (b.invitedCount !== a.invitedCount) return b.invitedCount - a.invitedCount;
      if (b.fullyJoinedCount !== a.fullyJoinedCount) {
        return b.fullyJoinedCount - a.fullyJoinedCount;
      }
      return a.inviter.localeCompare(b.inviter);
    })
    .slice(0, limit);
}
