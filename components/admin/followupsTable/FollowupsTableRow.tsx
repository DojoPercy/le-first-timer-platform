import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  HiOutlineUserCircle,
  HiOutlineExclamationCircle,
  HiOutlineTrash,
} from "react-icons/hi";
import type { Followup } from "@/lib/types";
import { StatusBadge } from "@/components/_reusable_components/status-badge";
import { TextTruncate } from "@/components/_reusable_components/text-truncate";

interface FollowupsTableRowProps {
  followup: Followup;
  soulName: string;
  callerName: string;
  onViewClick: (followup: Followup) => void;
  onDeleteClick: (followup: Followup) => void;
}

const statusColors = {
  Contacted: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  "Not Reachable": "bg-gray-100 text-gray-800",
};

const truncateNotes = (notes: string) => {
  if (!notes) return "N/A";
  return notes.length > 50 ? notes.substring(0, 50) + "..." : notes;
};

export function FollowupsTableRow({
  followup,
  soulName,
  callerName,
  onViewClick,
  onDeleteClick,
}: FollowupsTableRowProps) {
  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="py-4 w-[22%]">
        <div className="flex items-center gap-2 min-w-0">
          <HiOutlineUserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{soulName}</span>
        </div>
      </TableCell>
      <TableCell className="py-4 w-[18%]">
        <div className="flex items-center gap-2 min-w-0">
          <HiOutlineUserCircle className="h-4 w-4 text-muted-foreground opacity-50 shrink-0" />
          <span className="truncate">{callerName}</span>
        </div>
      </TableCell>
      <TableCell className="py-4 w-[13%]">
        <span className="truncate block">
          {new Date(followup.date).toLocaleDateString()}
        </span>
      </TableCell>
      <TableCell className="py-4 w-[13%]">
        <StatusBadge status={followup.status} />
      </TableCell>
      <TableCell className="py-4 w-[18%]">
        <span className="truncate text-sm block">
          <TextTruncate text={followup.notes} />
        </span>
      </TableCell>
      <TableCell className="text-center py-4 w-[8%]">
        {followup.status === "Pending" ? (
          <Button
            variant="default"
            size="sm"
            onClick={() => onViewClick(followup)}
            title="Update status"
          >
            Update
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onViewClick(followup)}
            title="View details"
          >
            <HiOutlineExclamationCircle className="h-5 w-5 text-muted-foreground hover:text-primary" />
          </Button>
        )}
      </TableCell>
      <TableCell className="text-center py-4 w-[8%]">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDeleteClick(followup)}
          title="Delete follow-up"
        >
          <HiOutlineTrash className="h-5 w-5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
