import { TableSkeleton } from "@/components/_reusable_components/table-skeleton";

export function MySoulsTableSkeleton() {
  return (
    <TableSkeleton
      columns={[
        { width: "w-[25%]", height: "h-4", className: "w-32" },
        { width: "w-[15%]", height: "h-4", className: "w-24" },
        { width: "w-[20%]", height: "h-4", className: "w-28" },
        { width: "w-[15%]", height: "h-6", className: "w-20" },
        { width: "w-[15%]", height: "h-8", className: "w-24" },
        { width: "w-[5%]", height: "h-5", className: "w-5", centered: true },
      ]}
      rows={5}
    />
  );
}
