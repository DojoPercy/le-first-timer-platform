"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportsBranchSelectorProps {
  branches: Array<{ id: string; name: string; slug: string }>;
  selectedBranchId: string | null;
  onBranchChange: (branchId: string) => void;
}

export function ReportsBranchSelector({
  branches,
  selectedBranchId,
  onBranchChange,
}: ReportsBranchSelectorProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Branch Reports</p>
          <p className="text-xs text-muted-foreground">
            Select a branch to view and generate its reports.
          </p>
        </div>
        <Select value={selectedBranchId || undefined} onValueChange={onBranchChange}>
          <SelectTrigger className="w-full sm:w-[260px]">
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
