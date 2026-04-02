import { create } from "zustand";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import { useFirstTimerStore } from "@/lib/store/first-timer-store";
import { useFollowupStore } from "@/lib/store/followup-store";

export const ADMIN_AUTO_SYNC_EVENT = "first-timer-platform:auto-sync";
export const ADMIN_AUTO_SYNC_INTERVAL_MS = 2 * 60 * 1000;

type SyncPayload = {
  count?: number;
  updated?: number;
  autoAssigned?: number;
  message?: string;
};

interface AdminAutoSyncStore {
  isRunning: boolean;
  lastCheckedAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  summary: string;
  runAutoSync: (options?: { force?: boolean }) => Promise<void>;
}

async function parsePayload(response: Response) {
  return (await response.json().catch(() => null)) as SyncPayload | null;
}

function buildSummary(details: {
  syncedFirstTimers: number;
  updatedFirstTimers: number;
  autoAssigned: number;
}) {
  const parts: string[] = [];

  if (details.syncedFirstTimers > 0) {
    parts.push(
      `${details.syncedFirstTimers} new first timer${
        details.syncedFirstTimers === 1 ? "" : "s"
      }`
    );
  }

  if (details.updatedFirstTimers > 0) {
    parts.push(
      `${details.updatedFirstTimers} updated first timer${
        details.updatedFirstTimers === 1 ? "" : "s"
      }`
    );
  }

  if (details.autoAssigned > 0) {
    parts.push(`${details.autoAssigned} assigned automatically`);
  }

  if (parts.length === 0) {
    return "Checked branch sheets. No new updates yet.";
  }

  return `Auto sync pulled ${parts.join(" • ")}.`;
}

export const useAdminAutoSyncStore = create<AdminAutoSyncStore>((set, get) => ({
  isRunning: false,
  lastCheckedAt: null,
  lastSuccessAt: null,
  lastError: null,
  summary: "Auto sync is watching this branch for new first timer sheet updates.",

  runAutoSync: async ({ force = false } = {}) => {
    if (get().isRunning) {
      return;
    }

    if (typeof document !== "undefined" && document.hidden && !force) {
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      set({
        lastCheckedAt: new Date().toISOString(),
        lastError: "You are offline. Auto sync will resume when the connection returns.",
        summary: "Waiting for your internet connection before checking branch sheets.",
      });
      return;
    }

    set({ isRunning: true, lastError: null });

    const checkedAt = new Date().toISOString();

    try {
      const response = await fetch("/api/sync-sheets", { method: "POST" });
      const payload = await parsePayload(response);

      if (!response.ok && response.status !== 404) {
        throw new Error(payload?.message || "First timer auto sync failed.");
      }

      const syncedFirstTimers = payload?.count || 0;
      const updatedFirstTimers = payload?.updated || 0;
      const autoAssigned = payload?.autoAssigned || 0;
      const dataChanged =
        syncedFirstTimers > 0 || updatedFirstTimers > 0 || autoAssigned > 0;

      await Promise.all([
        useDashboardStore.getState().fetchStats(),
        useFirstTimerStore.getState().fetchFirstTimers(),
        useFollowupStore.getState().fetchFollowups(),
      ]);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(ADMIN_AUTO_SYNC_EVENT, {
            detail: {
              dataChanged,
              syncedFirstTimers,
              updatedFirstTimers,
              autoAssigned,
              checkedAt,
            },
          })
        );
      }

      set({
        isRunning: false,
        lastCheckedAt: checkedAt,
        lastSuccessAt: checkedAt,
        lastError: null,
        summary: buildSummary({
          syncedFirstTimers,
          updatedFirstTimers,
          autoAssigned,
        }),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Auto sync failed unexpectedly.";
      set({
        isRunning: false,
        lastCheckedAt: checkedAt,
        lastError: message,
        summary: message,
      });
    }
  },
}));
