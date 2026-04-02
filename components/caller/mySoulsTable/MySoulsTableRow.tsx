import { TableCell, TableRow } from "@/components/ui/table";
import { HiOutlinePhone } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Soul, Followup } from "@/lib/types";
import { hasFollowupThisWeek, formatNextFollowupDate, getNextFollowupDate } from "@/lib/utils/followup-week-check";
import { StatusBadge } from "@/components/_reusable_components/status-badge";

interface MySoulsTableRowProps {
  soul: Soul;
  followups: Followup[];
  callerId: string;
  onSelectSoul: (soul: Soul) => void;
  onViewDetails: (soul: Soul) => void;
}

export function MySoulsTableRow({
  soul,
  followups,
  callerId,
  onSelectSoul,
  onViewDetails,
}: MySoulsTableRowProps) {
  const getStatusBadge = (soul: Soul) => {
    const soulFollowups = followups
      .filter((f) => f.soul_id === soul.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (soulFollowups.length === 0) {
      return <StatusBadge status="Not Contacted" variant="outline" />;
    }

    const mostRecentFollowup = soulFollowups[0];
    const status = mostRecentFollowup.status;

    return <StatusBadge status={status} />;
  };

  const hasFollowup = hasFollowupThisWeek(followups, soul.id, callerId);
  const nextDate = getNextFollowupDate();
  const nextDateFormatted = formatNextFollowupDate(nextDate);

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="font-medium py-3 w-[25%] truncate">
        {soul.full_name}
      </TableCell>
      <TableCell className="py-3 w-[15%] truncate">
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
      <TableCell className="py-3 w-[20%] truncate">
        {soul.occupation || "-"}
      </TableCell>
      <TableCell className="py-3 w-[15%]">{getStatusBadge(soul)}</TableCell>
      <TableCell className="py-3 w-[15%]">
        {hasFollowup ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="w-full">
                <Button size="sm" disabled className="w-full sm:w-auto">
                  <span className="hidden sm:inline">Log Follow-up</span>
                  <span className="sm:hidden">Log</span>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                Follow-up already done this week.
                <br />
                Next follow-up: {nextDateFormatted}
              </p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button size="sm" onClick={() => onSelectSoul(soul)} className="w-full sm:w-auto">
            <span className="hidden sm:inline">Log Follow-up</span>
            <span className="sm:hidden">Log</span>
          </Button>
        )}
      </TableCell>
      <TableCell className="text-center py-3 w-[5%]">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onViewDetails(soul)}
        >
          <HiOutlineExclamationCircle className="h-5 w-5 text-primary" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
