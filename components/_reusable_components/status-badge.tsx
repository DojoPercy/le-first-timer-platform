import { Badge } from "@/components/ui/badge";

export const FOLLOWUP_STATUS_COLORS: Record<string, string> = {
  Contacted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  "Not Reachable": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "outline";
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={`${FOLLOWUP_STATUS_COLORS[status] || ""} font-normal`}
    >
      {status}
    </Badge>
  );
}
