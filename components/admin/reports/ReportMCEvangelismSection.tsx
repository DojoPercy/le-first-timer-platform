"use client";

import type { ReactNode } from "react";
import { Activity, HeartHandshake, Megaphone, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MCEvangelismOverview } from "@/lib/store/report-types";

interface ReportMCEvangelismSectionProps {
  mcEvangelism: MCEvangelismOverview | null | undefined;
}

const summaryIcons = {
  reached: <Megaphone className="h-3.5 w-3.5 text-sky-500" />,
  won: <HeartHandshake className="h-3.5 w-3.5 text-emerald-500" />,
  conversion: <Target className="h-3.5 w-3.5 text-amber-500" />,
  reports: <Activity className="h-3.5 w-3.5 text-violet-500" />,
} as const;

export function ReportMCEvangelismSection({
  mcEvangelism,
}: ReportMCEvangelismSectionProps) {
  return (
    <Card className="overflow-hidden border border-border/60 shadow-sm">
      <CardHeader className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
        <CardTitle className="text-sm font-semibold sm:text-base">
          MC Evangelism
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Outreach results recorded across mega church evangelism for this report period.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 px-4 py-4 sm:px-5">
        {mcEvangelism ? (
          <>
            <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
              <SummaryTile
                icon={summaryIcons.reached}
                label="People Reached"
                value={mcEvangelism.totalPeopleReached.toLocaleString()}
              />
              <SummaryTile
                icon={summaryIcons.won}
                label="Souls Won"
                value={mcEvangelism.totalSoulsWon.toLocaleString()}
              />
              <SummaryTile
                icon={summaryIcons.conversion}
                label="Conversion"
                value={`${mcEvangelism.conversionRate.toFixed(1)}%`}
              />
              <SummaryTile
                icon={summaryIcons.reports}
                label="Outreach Reports"
                value={mcEvangelism.totalReports.toLocaleString()}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-muted-foreground dark:border-slate-800">
                    <th className="pb-2 font-medium">MC</th>
                    <th className="pb-2 text-right font-medium">Reached</th>
                    <th className="pb-2 text-right font-medium">Won</th>
                    <th className="pb-2 text-right font-medium">Conversion</th>
                    <th className="pb-2 text-right font-medium">Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {mcEvangelism.stats.map((stat) => (
                    <tr
                      key={stat.mcName}
                      className="border-b border-slate-50 last:border-b-0 dark:border-slate-900"
                    >
                      <td className="py-2.5 font-medium text-foreground">{stat.mcName}</td>
                      <td className="py-2.5 text-right text-muted-foreground">
                        {stat.peopleReached.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-foreground">
                        {stat.soulsWon.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground">
                        {stat.conversionRate.toFixed(1)}%
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground">
                        {stat.reportsCount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900/30">
            No MC evangelism reports were recorded for this period.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-950">
          {icon}
        </div>
      </div>
    </div>
  );
}
