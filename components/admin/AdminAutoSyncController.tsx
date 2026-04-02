"use client";

import { useEffect } from "react";
import {
  ADMIN_AUTO_SYNC_INTERVAL_MS,
  useAdminAutoSyncStore,
} from "@/lib/store/admin-auto-sync-store";

export function AdminAutoSyncController() {
  useEffect(() => {
    const runAutoSync = (force = false) => {
      useAdminAutoSyncStore.getState().runAutoSync({ force });
    };

    runAutoSync(true);

    const intervalId = window.setInterval(() => {
      runAutoSync(false);
    }, ADMIN_AUTO_SYNC_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        runAutoSync(true);
      }
    };

    const handleOnline = () => {
      runAutoSync(true);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", handleOnline);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}
