import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface ColumnSkeleton {
  width: string;
  height?: string;
  className?: string;
  rounded?: boolean;
  centered?: boolean;
}

interface TableSkeletonProps {
  columns: ColumnSkeleton[];
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {columns.map((col, colIndex) => (
            <TableCell key={colIndex} className={col.width}>
              <div className={col.centered ? "mx-auto w-fit" : ""}>
                <Skeleton
                  className={`${col.height || "h-5"} ${
                    col.className || "w-full max-w-[150px]"
                  } ${col.rounded ? "rounded-full" : ""}`}
                />
              </div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// Pre-configured skeleton for common table layouts
export function SimpleTableSkeleton({ columns: columnCount = 5, rows = 5 }: { columns?: number; rows?: number }) {
  const columns = Array.from({ length: columnCount }, () => ({
    width: `w-[${Math.floor(100 / columnCount)}%]`,
    height: "h-5",
    className: "w-full max-w-[150px]",
  }));

  return <TableSkeleton columns={columns} rows={rows} />;
}
