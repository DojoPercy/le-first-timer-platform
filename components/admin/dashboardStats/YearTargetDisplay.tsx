"use client";

import { HiOutlineChartBar } from "react-icons/hi";
import { Progress } from "@/components/ui/progress";

interface YearTargetDisplayProps {
  yearTarget: number | null;
  currentSouls: number;
  progressPercentage: number;
}

export function YearTargetDisplay({
  yearTarget,
  currentSouls,
  progressPercentage,
}: YearTargetDisplayProps) {
  if (yearTarget) {
    return (
      <>
        <div className="flex-shrink-0">
          <HiOutlineChartBar className="text-primary h-5 w-5" />
        </div>
        <div className="flex min-w-0 flex-nowrap items-center gap-3 flex-1">
          <p className="text-sm sm:text-md font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
            Year's Target: {currentSouls.toLocaleString()} / {yearTarget.toLocaleString()}
          </p>
          <div className="flex min-w-[160px] flex-1 items-center gap-2">
            <Progress value={progressPercentage} className="h-2 flex-1 min-w-[120px]" />
            <span className="text-xs font-medium text-primary whitespace-nowrap">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <HiOutlineChartBar className="text-muted-foreground h-5 w-5" />
      <p className="text-sm text-muted-foreground">
        No target set for {new Date().getFullYear()}
      </p>
    </div>
  );
}
