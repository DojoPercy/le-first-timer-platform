import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { HiOutlineUserCircle } from "react-icons/hi";
import type { CallerFollowupStats } from "./types";

interface CallersStatsTableProps {
  callersStats: CallerFollowupStats[];
}

export function CallersStatsTable({ callersStats }: CallersStatsTableProps) {
  const router = useRouter();

  if (callersStats.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No callers found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-[#121D55] text-white">Caller</TableHead>
            <TableHead className="bg-[#121D55] text-white">
              <span className="hidden sm:inline">Assigned Souls</span>
              <span className="sm:hidden">Assigned</span>
            </TableHead>
            <TableHead className="bg-[#121D55] text-white">
              <span className="hidden sm:inline">Follow-ups This Week</span>
              <span className="sm:hidden">Week Made</span>
            </TableHead>
            <TableHead className="bg-[#121D55] text-white">
              <span className="hidden sm:inline">Needed This Week</span>
              <span className="sm:hidden">Week Need</span>
            </TableHead>
            <TableHead className="bg-[#121D55] text-white">This Week</TableHead>
            <TableHead className="bg-[#121D55] text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {callersStats.map((stat) => (
            <TableRow key={stat.caller.id}>
              <TableCell className="font-medium">
                {stat.caller.name}
              </TableCell>
              <TableCell>{stat.assignedSouls}</TableCell>
              <TableCell>{stat.totalFollowupsMade}</TableCell>
              <TableCell>{stat.totalFollowupsNeeded}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-25">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        stat.percentage >= 80
                          ? "bg-green-500"
                          : stat.percentage >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium min-w-11.25">
                    {Math.min(stat.percentage, 100)}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/followups/${stat.caller.id}`)
                  }
                  className="gap-2"
                >
                  <HiOutlineUserCircle className="h-4 w-4" />
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
