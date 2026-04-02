"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Users, Heart, Clock, MapPin } from "lucide-react";
import type { MCEvangelismReport } from "@/lib/types";
import { formatDate, formatTime } from "./mcPerformanceTableUtils";

interface MCPerformanceTableDialogProps {
  selectedMC: string | null;
  mcReports: MCEvangelismReport[];
  selectedYear: number;
  selectedMonth: string;
  monthLabel?: string;
  onClose: () => void;
}

export function MCPerformanceTableDialog({
  selectedMC,
  mcReports,
  selectedYear,
  selectedMonth,
  monthLabel,
  onClose,
}: MCPerformanceTableDialogProps) {
  return (
    <Dialog open={!!selectedMC} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold tracking-tight">
              {selectedMC}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {mcReports.length} outreach report{mcReports.length !== 1 ? "s" : ""}
              {selectedMonth !== "all" && monthLabel ? ` in ${monthLabel} ${selectedYear}` : ` in ${selectedYear}`}
            </p>
          </DialogHeader>

          {/* Summary bar */}
          {mcReports.length > 0 && (
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1.5 rounded-full">
                <Users className="h-3 w-3" />
                {mcReports.reduce((s, r) => s + r.people_reached_out, 0).toLocaleString()} reached
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1.5 rounded-full">
                <Heart className="h-3 w-3" />
                {mcReports.reduce((s, r) => s + r.souls_won, 0).toLocaleString()} souls won
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-3 sm:py-4">
          {mcReports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No reports found.</p>
          ) : (
            <div className="space-y-3">
              {mcReports.map((report) => {
                const conversion = report.people_reached_out > 0
                  ? ((report.souls_won / report.people_reached_out) * 100).toFixed(0)
                  : "0";

                return (
                  <div
                    key={report.id}
                    className="group rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/40 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                  >
                    {/* Date bar */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-primary/10 bg-primary/[0.03] dark:bg-primary/[0.06] rounded-t-xl">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-semibold">{formatDate(report.outreach_date)}</span>
                      </div>
                      <span className="text-[11px] font-medium text-primary/70 px-2 py-0.5 rounded-md bg-primary/5 border border-primary/10">
                        {new Date(report.outreach_date).toLocaleDateString("en-US", { weekday: "long" })}
                      </span>
                    </div>

                    <div className="px-4 py-3 space-y-3">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 rounded-lg bg-primary/[0.04] dark:bg-primary/10">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Reached</p>
                          <p className="text-lg font-bold text-primary">{report.people_reached_out}</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-primary/[0.04] dark:bg-primary/10">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Won</p>
                          <p className="text-lg font-bold text-primary">{report.souls_won}</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-primary/[0.04] dark:bg-primary/10">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Conversion</p>
                          <p className="text-lg font-bold text-primary">{conversion}%</p>
                        </div>
                      </div>

                      {/* Time & Location */}
                      {(report.outreach_time || report.outreach_end_time || report.outreach_location) && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-dashed border-primary/10">
                          {(report.outreach_time || report.outreach_end_time) && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 text-primary/60" />
                              <span>
                                {formatTime(report.outreach_time)}
                                {report.outreach_end_time && (
                                  <span className="text-foreground font-medium"> → {formatTime(report.outreach_end_time)}</span>
                                )}
                              </span>
                            </div>
                          )}
                          {report.outreach_location && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 text-primary/60" />
                              <span className="text-foreground font-medium">{report.outreach_location}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}