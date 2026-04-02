import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { HiOutlineUserCircle, HiOutlineExclamationCircle } from "react-icons/hi";
import type { Followup } from "@/lib/types";
import { StatusBadge } from "@/components/_reusable_components/status-badge";
import { TextTruncate } from "@/components/_reusable_components/text-truncate";
// ...existing code...

interface MyFollowupsTableRowProps {
  followup: Followup;
  soulName: string;
  onViewClick: (followup: Followup) => void;
}

export function MyFollowupsTableRow({
  followup,
  soulName,
  onViewClick,
}: MyFollowupsTableRowProps) {
  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="font-medium py-4 w-[30%]">
        <div className="flex items-center gap-2 min-w-0">
          <HiOutlineUserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">{soulName}</span>
        </div>
      </TableCell>
      <TableCell className="py-4 w-[15%]">
        <span className="truncate block">{new Date(followup.date).toLocaleDateString()}</span>
      </TableCell>
      <TableCell className="py-4 w-[15%]">
        <StatusBadge status={followup.status} />
      </TableCell>
      <TableCell className="py-4 max-w-[60px] w-[60px]">
        <div style={{ maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="text-sm">
          {followup.notes}
        </div>
      </TableCell>
      <TableCell className="text-center py-4 w-[15%]">
        <Button
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => onViewClick(followup)}
        >
          <span className="hidden sm:inline">Update</span>
          <span className="sm:hidden">Upd</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}
