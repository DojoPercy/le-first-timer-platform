"use client";

import { Building2, MousePointerClick, UserPlus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { PlatformReportsResponse } from "@/lib/super-admin/platform-reports-types";

interface PlatformReportsOverviewCardsProps {
  overview: PlatformReportsResponse["overview"];
}

export function PlatformReportsOverviewCards({ overview }: PlatformReportsOverviewCardsProps) {
  const cardData = [
    {
      title: "Total Souls",
      value: overview.totalSouls,
      icon: <Users className="h-3.5 w-3.5 text-blue-500" />,
      helper: "Platform total",
    },
    {
      title: "Souls Won",
      value: overview.soulsWonInPeriod,
      icon: <UserPlus className="h-3.5 w-3.5 text-green-500" />,
      helper: "This period",
    },
    {
      title: "Follow-ups",
      value: overview.totalFollowups,
      icon: <MousePointerClick className="h-3.5 w-3.5 text-purple-500" />,
      helper: "This period",
    },
    {
      title: "Active Branches",
      value: overview.activeBranches,
      icon: <Building2 className="h-3.5 w-3.5 text-orange-500" />,
      helper: `${overview.branchesWithSouls} with souls won`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-2.5 xl:grid-cols-4">
      {cardData.map((card) => (
        <Card key={card.title} className="overflow-hidden border border-border/60 py-0 shadow-sm">
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






