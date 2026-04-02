import { TableSkeleton } from "@/components/_reusable_components/table-skeleton";

export function MyFollowupsTableSkeleton() {
  return (
    <TableSkeleton
      columns={[
        { width: "w-[30%]", className: "w-full max-w-[200px]" },
        { width: "w-[15%]", className: "w-full max-w-[100px]" },
        { width: "w-[15%]", height: "h-6", className: "w-full max-w-[80px]" },
        { width: "w-[35%]", className: "w-full max-w-[300px]" },
        { width: "w-[5%]", height: "h-8", className: "w-8", centered: true },
      ]}
      rows={5}
    />
  );
}
