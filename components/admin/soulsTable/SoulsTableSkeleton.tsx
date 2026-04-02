import { TableSkeleton } from "@/components/_reusable_components/table-skeleton";

export function SoulsTableSkeleton() {
  return (
    <TableSkeleton
      columns={[
        { width: "w-[25%]", className: "w-full max-w-[200px]" },
        { width: "w-[15%]", className: "w-full max-w-[120px]" },
        { width: "w-[20%]", className: "w-full max-w-[150px]" },
        { width: "w-[15%]", className: "w-full max-w-[120px]" },
        { width: "w-[20%]", height: "h-8", className: "w-full max-w-[180px]" },
        { width: "w-[5%]", height: "h-8", className: "w-8", centered: true },
      ]}
      rows={5}
    />
  );
}
