import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column {
  header: string;
  width: string;
  className?: string;
  srOnly?: boolean;
}

interface TableContainerProps {
  columns: Column[];
  children: ReactNode;
  isLoading?: boolean;
  loadingSkeleton?: ReactNode;
  emptyMessage?: string;
  minWidth?: string;
}

export function TableContainer({
  columns,
  children,
  isLoading,
  loadingSkeleton,
  emptyMessage = "No data available",
  minWidth = "700px",
}: TableContainerProps) {
  return (
    <div className="rounded-md border-x-0 md:border-x border-y overflow-hidden relative max-h-[calc(100vh-300px)] flex flex-col">
      <div className="overflow-x-auto -mx-0">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-background" style={{ minWidth }}>
          <Table className="table-fixed w-full">
            <TableHeader className="bg-[#121D55]">
              <TableRow>
                {columns.map((col, index) => (
                  <TableHead
                    key={index}
                    className={`font-semibold py-4 ${col.width} text-white ${col.className || ""}`}
                  >
                    {col.srOnly ? (
                      <span className="sr-only">{col.header}</span>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1" style={{ minWidth }}>
          <Table className="table-fixed w-full">
            <TableBody>
              {isLoading ? loadingSkeleton : children}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
