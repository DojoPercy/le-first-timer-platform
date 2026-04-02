"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { SoulWin } from "@/lib/store/reports-store";
import { EmptyState } from "@/components/_reusable_components/empty-state";

interface SoulWinsTableProps {
  soulWins: SoulWin[];
  onRefresh: () => void;
  hideRefresh?: boolean;
}

export function SoulWinsTable({
  soulWins,
  onRefresh,
  hideRefresh = false,
}: SoulWinsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatMonth = (year: number, month: number) => {
    const monthNames = [
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
    ];
    return `${monthNames[month - 1]} ${year}`;
  };

  return (
    <div className="space-y-4">
      {!hideRefresh && (
        <div className="flex justify-end p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 text-nowrap pl-6">
                Soul Name
              </TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 text-nowrap">
                Phone
              </TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 text-nowrap">
                Caller
              </TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 text-nowrap">
                Won Date
              </TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 text-nowrap">
                Month
              </TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 text-nowrap">
                Week
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {soulWins.length === 0 ? (
              <EmptyState colSpan={6} message="No soul wins tracked yet." />
            ) : (
              soulWins.map((win) => (
                <TableRow
                  key={win.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group text-[13px]"
                >
                  <TableCell className="font-bold whitespace-nowrap pl-6 py-4 text-slate-900 dark:text-slate-100">
                    {win.souls?.full_name || "Unknown"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-4">
                    {win.souls?.phone || "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-4 font-medium text-slate-700 dark:text-slate-300">
                    {win.callers?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-4 opacity-70 italic">
                    {formatDate(win.won_date)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                      {formatMonth(win.year, win.month)}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-4">
                    {win.week_number ? `Week ${win.week_number}` : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
