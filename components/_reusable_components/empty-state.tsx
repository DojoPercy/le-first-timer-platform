import { TableCell, TableRow } from "@/components/ui/table";

interface EmptyStateProps {
  colSpan: number;
  message?: string;
  className?: string;
}

export function EmptyState({
  colSpan,
  message = "No data available",
  className,
}: EmptyStateProps) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className={`text-center py-12 text-muted-foreground ${className || ""}`}
      >
        {message}
      </TableCell>
    </TableRow>
  );
}
