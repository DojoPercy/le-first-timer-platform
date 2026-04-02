"use client";

import { Radar, RefreshCcw, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAdminAutoSyncStore } from "@/lib/store/admin-auto-sync-store";

interface AutoSyncStatusProps {
  variant?: "card" | "header";
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Waiting for the first check";
  }

  const date = new Date(value);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AutoSyncStatus({ variant = "card" }: AutoSyncStatusProps) {
  const { isRunning, lastCheckedAt, lastError } = useAdminAutoSyncStore();
  const badgeClass = lastError
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : "border-sky-200 bg-sky-50 text-sky-700";

  if (variant === "header") {
    return (
      <div className="hidden items-end gap-1 text-right md:flex">
        <Badge variant="outline" className={badgeClass}>
          {lastError ? (
            <TriangleAlert className="mr-1 h-3.5 w-3.5" />
          ) : isRunning ? (
            <RefreshCcw className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Radar className="mr-1 h-3.5 w-3.5" />
          )}
          {lastError ? "Needs attention" : isRunning ? "Checking branch sheets" : "Auto sync live"}
        </Badge>
        <p className="text-[11px] text-slate-500">Last checked: {formatTimestamp(lastCheckedAt)}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_100%)] p-4 shadow-sm">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className={badgeClass}
        >
          {lastError ? (
            <TriangleAlert className="mr-1 h-3.5 w-3.5" />
          ) : isRunning ? (
            <RefreshCcw className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Radar className="mr-1 h-3.5 w-3.5" />
          )}
          {lastError ? "Needs attention" : isRunning ? "Checking branch sheets" : "Auto sync live"}
        </Badge>
        <p className="text-xs text-slate-500">Last checked: {formatTimestamp(lastCheckedAt)}</p>
      </div>
    </div>
  );
}
