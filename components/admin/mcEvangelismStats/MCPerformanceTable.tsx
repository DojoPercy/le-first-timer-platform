"use client";


import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { MCEvangelismReport } from "@/lib/types";
import { MCPerformanceTableDialog } from "./MCPerformanceTableDialog";
import { formatDate, formatTime } from "./mcPerformanceTableUtils";

interface MCStats {
  mc_name: string;
  total_people_reached: number;
  total_souls_won: number;
  reports_count: number;
}

interface MCPerformanceTableProps {
  stats: MCStats[];
  reports: MCEvangelismReport[];
  selectedYear: number;
  selectedMonth: string;
  monthLabel?: string;
}

export function MCPerformanceTable({
  stats,
  reports,
  selectedYear,
  selectedMonth,
  monthLabel,
}: MCPerformanceTableProps) {
  const [selectedMC, setSelectedMC] = useState<string | null>(null);

  const mcReports = selectedMC
    ? reports
        .filter((r) => r.mc_name === selectedMC)
        .sort((a, b) => new Date(b.outreach_date).getTime() - new Date(a.outreach_date).getTime())
    : [];

  if (stats.length === 0) {
    return (
      <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
        <h4 className="text-sm font-semibold mb-3 text-slate-900 dark:text-slate-100">
          MC Performance Breakdown
        </h4>
        <div className="text-center py-8 text-muted-foreground">
          <p>
            No MC evangelism reports found for{" "}
            {selectedMonth !== "all" ? `${monthLabel} ${selectedYear}` : selectedYear}
          </p>
          <p className="text-sm mt-2">Click &quot;Sync Reports&quot; to fetch data from Google Sheets</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
        <h4 className="text-sm font-semibold mb-3 text-slate-900 dark:text-slate-100">
          MC Performance Breakdown
        </h4>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100 dark:bg-slate-800">
                <TableHead className="font-semibold">MC Name</TableHead>
                <TableHead className="font-semibold text-center">People Reached</TableHead>
                <TableHead className="font-semibold text-center">Souls Won</TableHead>
                <TableHead className="font-semibold text-center">Conversion</TableHead>
                <TableHead className="font-semibold text-center">Reports</TableHead>
                <TableHead className="font-semibold text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => {
                const conversion =
                  stat.total_people_reached > 0
                    ? ((stat.total_souls_won / stat.total_people_reached) * 100).toFixed(1)
                    : "0.0";

                return (
                  <TableRow key={stat.mc_name}>
                    <TableCell className="font-medium">{stat.mc_name}</TableCell>
                    <TableCell className="text-center">
                      {stat.total_people_reached.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold">
                        {stat.total_souls_won.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{conversion}%</TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {stat.reports_count}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMC(stat.mc_name)}
                        className="text-primary hover:text-primary/80"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Dialog */}
      <MCPerformanceTableDialog
        selectedMC={selectedMC}
        mcReports={mcReports}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        monthLabel={monthLabel}
        onClose={() => setSelectedMC(null)}
      />
    </>
  );
}
