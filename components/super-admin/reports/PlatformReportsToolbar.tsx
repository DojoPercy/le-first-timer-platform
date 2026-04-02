"use client";

import { Building2, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlatformReportPeriod } from "@/lib/super-admin/platform-reports-types";

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

interface PlatformReportsToolbarProps {
  period: PlatformReportPeriod;
  viewMode: "overview" | "branches";
  selectedMonth: number;
  selectedYear: number;
  onPeriodChange: (period: PlatformReportPeriod) => void;
  onViewModeChange: (viewMode: "overview" | "branches") => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export function PlatformReportsToolbar({
  period,
  viewMode,
  selectedMonth,
  selectedYear,
  onPeriodChange,
  onViewModeChange,
  onMonthChange,
  onYearChange,
}: PlatformReportsToolbarProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2025 }, (_, index) => currentYear - index);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-900/50">
      <Tabs
        value={period}
        onValueChange={(value) => onPeriodChange(value as PlatformReportPeriod)}
        className="w-full lg:w-auto"
      >
        <TabsList className="flex w-full gap-0.5 rounded-xl bg-slate-100 p-1 sm:w-auto dark:bg-slate-800">
          <TabsTrigger value="weekly" className="flex-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold sm:flex-initial sm:px-4 sm:text-xs">
            Weekly
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold sm:flex-initial sm:px-4 sm:text-xs">
            Monthly
          </TabsTrigger>
          <TabsTrigger value="yearly" className="flex-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold sm:flex-initial sm:px-4 sm:text-xs">
            Yearly
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center">
        <div className="flex items-center gap-1 overflow-hidden rounded-xl bg-slate-100 p-1 shadow-inner dark:bg-slate-800">
          <Button
            variant={viewMode === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("overview")}
            className={`h-7 gap-1.5 rounded-lg px-2 text-[10px] sm:h-8 sm:px-3 sm:text-[11px] ${
              viewMode === "overview"
                ? "border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-950"
                : ""
            }`}
          >
            <Layout className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">General Overview</span>
            <span className="sm:hidden">Overview</span>
          </Button>
          <Button
            variant={viewMode === "branches" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("branches")}
            className={`h-7 gap-1.5 rounded-lg px-2 text-[10px] sm:h-8 sm:px-3 sm:text-[11px] ${
              viewMode === "branches"
                ? "border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-950"
                : ""
            }`}
          >
            <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">Branch Analysis</span>
            <span className="sm:hidden">Branches</span>
          </Button>
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {period === "monthly" ? (
          <Select value={String(selectedMonth)} onValueChange={(value) => onMonthChange(Number(value))}>
            <SelectTrigger className="h-8 w-[160px] text-[11px] sm:h-9 sm:text-xs">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {MONTH_LABELS.map((label, index) => (
                <SelectItem key={label} value={String(index)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {period !== "weekly" ? (
          <Select value={String(selectedYear)} onValueChange={(value) => onYearChange(Number(value))}>
            <SelectTrigger className="h-8 w-[110px] text-[11px] sm:h-9 sm:text-xs">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="rounded-md border border-border/60 bg-background px-3 py-2 text-[10px] text-muted-foreground sm:text-xs">
            Current week overview
          </div>
        )}
      </div>
    </div>
  );
}
