import { TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  HiOutlinePhone,
  HiOutlineAcademicCap,
  HiOutlineLocationMarker,
  HiOutlineUserCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import type { Soul, Caller } from "@/lib/types";

interface SoulsTableRowProps {
  soul: Soul;
  callers: Caller[];
  onAssignCaller: (soulId: string, callerId: string) => void;
  onViewDetails: (soul: Soul) => void;
}

export function SoulsTableRow({
  soul,
  callers,
  onAssignCaller,
  onViewDetails,
}: SoulsTableRowProps) {
  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="font-medium py-3 w-[25%]">
        <span className="truncate block">{soul.full_name}</span>
      </TableCell>
      <TableCell className="py-2 w-[15%]">
        <div className="flex items-center gap-1.5 min-w-0">
          <HiOutlinePhone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {soul.phone ? (
            <a
              href={`tel:${soul.phone}`}
              className="truncate text-primary underline hover:text-primary/80"
              title={`Call ${soul.phone}`}
            >
              {soul.phone}
            </a>
          ) : (
            <span className="truncate">-</span>
          )}
        </div>
      </TableCell>
      <TableCell className="py-3 w-[20%]">
        <div className="flex items-center gap-1.5 min-w-0">
          <HiOutlineAcademicCap className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">{soul.occupation || "-"}</span>
        </div>
      </TableCell>
      <TableCell className="py-3 w-[15%]">
        <div className="flex items-center gap-1.5 min-w-0">
          <HiOutlineLocationMarker className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">{soul.location || "-"}</span>
        </div>
      </TableCell>
      <TableCell className="py-3 w-[20%]">
        <Select
          value={soul.assigned_caller_id || "unassigned"}
          onValueChange={(callerId) => onAssignCaller(soul.id, callerId)}
        >
          <SelectTrigger className="w-full max-w-[180px] h-8 text-xs bg-background/50">
            <SelectValue placeholder="Assign..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">
              <span className="flex items-center gap-2">Unassigned</span>
            </SelectItem>
            {callers
              .filter((caller) => caller.role === "caller")
              .map((caller) => (
                <SelectItem key={caller.id} value={caller.id}>
                  <span className="flex items-center gap-2">
                    <HiOutlineUserCircle className="h-4 w-4 opacity-50 shrink-0" />
                    <span className="truncate">{caller.name}</span>
                  </span>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-center py-3 w-[5%]">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onViewDetails(soul)}
          title="View details"
        >
          <HiOutlineExclamationCircle className="h-5 w-5 text-muted-foreground hover:text-primary" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
