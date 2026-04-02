import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// Note: This skeleton has a custom first column with avatar, so we keep it custom
export function UsersTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="w-[30%]">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-full max-w-[200px]" />
            </div>
          </TableCell>
          <TableCell className="w-[12%]">
            <Skeleton className="h-6 w-full max-w-[60px]" />
          </TableCell>
          <TableCell className="w-[30%]">
            <Skeleton className="h-5 w-full max-w-[200px]" />
          </TableCell>
          <TableCell className="text-center w-[15%]">
            <Skeleton className="h-5 w-12 mx-auto" />
          </TableCell>
          <TableCell className="text-center w-[13%]">
            <Skeleton className="h-8 w-8 mx-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
