"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateMonthYearOptions, MONTH_NAMES } from "@/app/admin/reports/reports-page-constants";

interface ReportsMonthlyToolbarProps {
  selectedMonth: number;
  selectedYear: number;
  onPeriodChange: (month: number, year: number) => void;
  onCompare: () => void;
}

export function ReportsMonthlyToolbar({
  selectedMonth,
  selectedYear,
  onPeriodChange,
  onCompare,
}: ReportsMonthlyToolbarProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="min-w-30">
            {`${MONTH_NAMES[selectedMonth]} ${selectedYear}`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {generateMonthYearOptions().map((option) => (
            <DropdownMenuItem
              key={`${option.year}-${option.month}`}
              onClick={() => onPeriodChange(option.month, option.year)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" size="sm" onClick={onCompare}>
        Compare Side by Side
      </Button>
    </div>
  );
}
