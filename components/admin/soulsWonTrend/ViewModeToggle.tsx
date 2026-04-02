import { Button } from "@/components/ui/button";

interface ViewModeToggleProps {
  viewMode: "monthly" | "yearly";
  onViewModeChange: (mode: "monthly" | "yearly") => void;
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={viewMode === "monthly" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewModeChange("monthly")}
        className="h-7 text-xs"
      >
        Monthly
      </Button>
      <Button
        variant={viewMode === "yearly" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewModeChange("yearly")}
        className="h-7 text-xs"
      >
        Yearly
      </Button>
    </div>
  );
}
