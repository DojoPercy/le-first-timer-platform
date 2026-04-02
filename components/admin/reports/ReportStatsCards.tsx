"use client";

import { AlertCircle, MousePointerClick, UserPlus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type {
  GlobalReportStats,
  MonthlyReport,
  WeeklyReport,
  YearlyReport,
} from "@/lib/store/reports-store";

interface ReportStatsCardsProps {
  reports: (WeeklyReport | MonthlyReport | YearlyReport)[];
  globalStats?: GlobalReportStats | null;
}

export function ReportStatsCards({ reports, globalStats }: ReportStatsCardsProps) {
  const totalFollowups = reports.reduce((sum, report) => sum + report.total_followups_made, 0);
  const altarCallPercentage =
    globalStats?.soulsWonOnSundays && globalStats?.soulsWonInMonth
      ? `${((globalStats.soulsWonOnSundays / globalStats.soulsWonInMonth) * 100).toFixed(0)}% of souls won`
      : "This report period";

  const cardData = [
    {
      title: "Total Souls",
      value: globalStats?.totalSouls ?? 0,
      icon: <Users className="h-3.5 w-3.5 text-blue-500" />,
      helper: "Current system total",
    },
    {
      title: "Souls Won in Period",
      value: globalStats?.soulsWonInMonth ?? 0,
      icon: <UserPlus className="h-3.5 w-3.5 text-green-500" />,
      helper: "This report period",
    },
    {
      title: "Follow-ups Made",
      value: globalStats?.totalFollowups ?? totalFollowups,
      icon: <MousePointerClick className="h-3.5 w-3.5 text-purple-500" />,
      helper: "Calls & personal visits",
    },
    {
      title: "Altar Call Souls",
      value: globalStats?.soulsWonOnSundays ?? 0,
      icon: <AlertCircle className="h-3.5 w-3.5 text-orange-500" />,
      helper: altarCallPercentage,
    },
  ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-2 sm:gap-2.5 xl:grid-cols-4">
      {cardData.map((card) => (
        <Card key={card.title} className="overflow-hidden border border-border/60 shadow-sm py-0">
          <CardContent className="px-2.5 py-2.5 sm:px-3 sm:py-3">
            <div className="flex items-start justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[11px]">
                  {card.title}
                </p>
                <p className="mt-1.5 text-base font-semibold text-foreground sm:text-lg">
                  {card.value.toLocaleString()}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">{card.helper}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-1.5 dark:border-slate-800 dark:bg-slate-900">
                {card.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
