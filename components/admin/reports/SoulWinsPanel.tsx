"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SoulWinsTable } from "@/components/admin/reports/SoulWinsTable";
import type { SoulWin } from "@/lib/store/reports-store";

interface SoulWinsPanelProps {
  soulWins: SoulWin[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export function SoulWinsPanel({
  soulWins,
  isLoading,
  onRefresh,
}: SoulWinsPanelProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-6 dark:border-slate-900">
        <div>
          <h3 className="text-lg font-bold sm:text-xl">Soul Wins Tracking</h3>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Detailed history of souls won and followed-up.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} className="hidden sm:flex">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <SoulWinsTable soulWins={soulWins} onRefresh={onRefresh} hideRefresh />
    </div>
  );
}
