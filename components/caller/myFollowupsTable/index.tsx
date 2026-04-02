"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { PaginationInfo } from "@/components/_reusable_components/pagination-info";
import { FollowupModal } from "../followupModal";
import { useState } from "react";
import type { Followup, Soul, Caller } from "@/lib/types";
import { MyFollowupsTableHeader } from "./MyFollowupsTableHeader";
import { MyFollowupsTableRow } from "./MyFollowupsTableRow";
import { MyFollowupsTableSkeleton } from "./MyFollowupsTableSkeleton";
import { useMyFollowupsTable } from "./useMyFollowupsTable";

const ITEMS_PER_PAGE = 10;

interface MyFollowupsTableProps {
  callerId: string;
  caller: Caller;
}

export function MyFollowupsTable({ callerId, caller }: MyFollowupsTableProps) {
  const {
    followups,
    souls,
    isLoading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredFollowupsCount,
  } = useMyFollowupsTable(callerId);

  // State for update dialog (log follow-up)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateFollowup, setUpdateFollowup] = useState<Followup | null>(null);
  const [updateSoul, setUpdateSoul] = useState<Soul | null>(null);

  // Handler for refresh after update
  const handleUpdateSuccess = () => {
    setUpdateDialogOpen(false);
    setUpdateFollowup(null);
    setUpdateSoul(null);
    // You might want to refresh the followups list here
  };

  // Handler for action button click
  const handleActionClick = (followup: Followup) => {
    // Find the soul for this followup
    const soul = souls.get(followup.soul_id);
    const soulData = typeof soul === "string" ? null : soul;
    
    // Always open update modal for all followups
    setUpdateFollowup(followup);
    setUpdateSoul(soulData);
    setUpdateDialogOpen(true);
  };

  return (
    <Card className="border-none shadow-none md:shadow-md md:border">
      <MyFollowupsTableHeader
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterStatus}
      />

      <CardContent className="space-y-4 px-0 md:px-6 pb-4">
        <div className="rounded-md border-x-0 md:border-x border-y overflow-hidden relative max-h-[calc(100vh-300px)] flex flex-col">
          <div className="overflow-x-auto">
            <div className="sticky top-0 z-10 bg-background min-w-[600px]">
              <Table className="table-fixed w-full">
                <TableHeader className="bg-[#121D55]">
                  <TableRow>
                    <TableHead className="font-semibold py-4 w-[30%] text-white">Soul</TableHead>
                    <TableHead className="font-semibold py-4 w-[15%] text-white">Date</TableHead>
                    <TableHead className="font-semibold py-4 w-[15%] text-white">Status</TableHead>
                    <TableHead className="font-semibold py-4 max-w-[60px] w-[60px] text-white">Notes</TableHead>
                    <TableHead className="font-semibold text-center py-4 w-[5%] text-white">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>

            <div className="overflow-y-auto flex-1 min-w-[600px]">
              <Table className="table-fixed w-full">
                <TableBody>
                  {isLoading ? (
                    <MyFollowupsTableSkeleton />
                  ) : followups.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No follow-ups found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    followups.map((followup) => (
                      <MyFollowupsTableRow
                        key={followup.id}
                        followup={followup}
                        soulName={(() => {
                          const soul = souls.get(followup.soul_id);
                          return typeof soul === "string"
                            ? soul
                            : soul?.full_name || "Unknown";
                        })()}
                        onViewClick={handleActionClick}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="sticky bottom-0 bg-background border-t pt-4 pb-2 mt-4 px-4 md:px-0 flex flex-col items-center gap-4 z-10">
            <Pagination
              current={currentPage}
              total={totalPages}
              onChange={setCurrentPage}
            />
            <PaginationInfo
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredFollowupsCount}
              itemName="follow-ups"
            />
          </div>
        )}
      </CardContent>



      {/* Use FollowupModal for update */}
      <FollowupModal
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        soul={updateSoul}
        caller={caller}
        onSuccess={handleUpdateSuccess}
        existingFollowup={updateFollowup}
      />
    </Card>
  );
}
