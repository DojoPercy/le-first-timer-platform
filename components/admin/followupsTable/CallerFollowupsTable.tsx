"use client";

import { HiOutlineExclamationCircle, HiOutlineTrash } from "react-icons/hi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { getSoulName, statusColors, truncateNotes } from "@/app/admin/followups/[callerId]/caller-followups-helpers";
import type { Followup, Soul } from "@/lib/types";

interface CallerFollowupsTableProps {
  followups: Followup[];
  souls: Soul[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (followup: Followup) => void;
  onView: (followup: Followup) => void;
  onDelete: (followup: Followup) => void;
}

export function CallerFollowupsTable({
  followups,
  souls,
  totalPages,
  currentPage,
  onPageChange,
  onEdit,
  onView,
  onDelete,
}: CallerFollowupsTableProps) {
  return (
    <>
      <div className="-mx-4 overflow-x-auto sm:mx-0">
        <Table className="min-w-137.5">
          <TableHeader>
            <TableRow>
              <TableHead className="bg-[#121D55] text-white">Soul</TableHead>
              <TableHead className="bg-[#121D55] text-white">Date</TableHead>
              <TableHead className="bg-[#121D55] text-white">Status</TableHead>
              <TableHead className="bg-[#121D55] text-white">Notes</TableHead>
              <TableHead className="bg-[#121D55] text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {followups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No follow-ups found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              followups.map((followup) => (
                <TableRow key={followup.id}>
                  <TableCell className="font-medium">
                    {getSoulName(souls, followup.soul_id)}
                  </TableCell>
                  <TableCell>{new Date(followup.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[followup.status] || ""}>
                      {followup.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-50">
                    <span className="block truncate">{truncateNotes(followup.notes)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {followup.status === "Pending" ? (
                        <Button variant="default" size="sm" onClick={() => onEdit(followup)}>
                          Update
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => onView(followup)}>
                          <HiOutlineExclamationCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(followup)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 ? (
        <Pagination current={currentPage} total={totalPages} onChange={onPageChange} />
      ) : null}
    </>
  );
}
