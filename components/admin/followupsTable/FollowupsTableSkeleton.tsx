import { TableSkeleton } from "@/components/_reusable_components/table-skeleton";

export function FollowupsTableSkeleton() {
  return (
    <TableSkeleton
      columns={[
        { width: "w-[22%]", className: "w-full max-w-[180px]" },
        { width: "w-[18%]", className: "w-full max-w-[140px]" },
        { width: "w-[13%]", className: "w-full max-w-[100px]" },
        { width: "w-[13%]", height: "h-6", className: "w-full max-w-[80px]" },
        { width: "w-[18%]", className: "w-full max-w-[200px]" },
        { width: "w-[8%]", height: "h-8", className: "w-8", centered: true },
        { width: "w-[8%]", height: "h-8", className: "w-8", centered: true },
      ]}
      rows={5}
    />
  );
}
