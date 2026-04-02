interface PaginationInfoProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  itemName?: string;
}

export function PaginationInfo({
  currentPage,
  itemsPerPage,
  totalItems,
  itemName = "items",
}: PaginationInfoProps) {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <p className="text-sm text-muted-foreground">
      Showing {start} to {end} of {totalItems} {itemName}
    </p>
  );
}
