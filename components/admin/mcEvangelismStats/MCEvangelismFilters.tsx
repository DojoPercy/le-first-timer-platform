import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HiOutlineRefresh } from "react-icons/hi";

interface MCEvangelismFiltersProps {
  selectedYear: number;
  selectedMonth: string;
  onYearChange: (year: number) => void;
  onMonthChange: (month: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  isLoading: boolean;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 3 }, (_, i) => CURRENT_YEAR - i);

const MONTH_OPTIONS = [
  { value: "all", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function MCEvangelismFilters({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  onSync,
  isSyncing,
  isLoading,
}: MCEvangelismFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 ">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Year:</span>
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => onYearChange(parseInt(value))}
        >
          <SelectTrigger className="w-30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Month:</span>
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="w-35">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTH_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onSync}
        disabled={isSyncing || isLoading}
        className="gap-2 ml-auto"
      >
        <HiOutlineRefresh className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
        {isSyncing ? "Syncing..." : "Sync Reports"}
      </Button>
    </div>
  );
}

export { MONTH_OPTIONS };
