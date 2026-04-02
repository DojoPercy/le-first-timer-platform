"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import DeleteConfirmDialog from "@/components/_reusable_components/delete-confirm-dialog";
import { PaginationInfo } from "@/components/_reusable_components/pagination-info";
import { FollowupModal } from "@/components/caller/followupModal";
import { FollowupDetailsDialog } from "./FollowupDetailsDialog";
import { FollowupsTableHeader } from "./FollowupsTableHeader";
import { FollowupsTableRow } from "./FollowupsTableRow";
import { FollowupsTableSkeleton } from "./FollowupsTableSkeleton";
import { useFollowupsTable } from "./useFollowupsTable";
import { useState } from "react";

const ITEMS_PER_PAGE = 10;

export function FollowupsTable() {
  const {
    followups,
    isLoading,
    souls,
    callers,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredFollowupsCount,
    selectedFollowup,
    setSelectedFollowup,
    isDialogOpen,
    setIsDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    followupToDelete,
    isDeleting,
    resetting,
    resetDialogOpen,
    setResetDialogOpen,
    handleDeleteClick,
    confirmDelete,
    handleResetFollowups,
    fetchFollowups,
  } = useFollowupsTable();

  // State for read-only details dialog
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [viewFollowup, setViewFollowup] = useState(null);

  // Handler for view/update click
  const handleViewClick = (followup: any) => {
    if (followup.status === "Pending") {
      // Open editable modal for pending status
      setSelectedFollowup(followup);
      setIsDialogOpen(true);
    } else {
      // Open read-only dialog for other statuses
      setViewFollowup(followup);
      setViewDetailsOpen(true);
    }
  };

  return (
    <Card className="border-none shadow-none md:shadow-md md:border">
      <FollowupsTableHeader
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        resetting={resetting}
        isLoading={isLoading}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterStatus}
        onResetClick={() => setResetDialogOpen(true)}
      />

      <CardContent className="space-y-4 px-0 md:px-6 pb-4">
        <div className="rounded-md border-x-0 md:border-x border-y overflow-hidden relative max-h-[calc(100vh-300px)] flex flex-col">
          <div className="overflow-x-auto">
            <div className="sticky top-0 z-10 bg-background min-w-[700px]">
              <Table className="table-fixed w-full">
                <TableHeader className="bg-[#121D55]">
                  <TableRow>
                    <TableHead className="font-semibold py-4 w-[22%] text-white">
                      Soul
                    </TableHead>
                    <TableHead className="font-semibold py-4 w-[18%] text-white">
                      Caller
                    </TableHead>
                    <TableHead className="font-semibold py-4 w-[13%] text-white">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold py-4 w-[13%] text-white">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold py-4 w-[18%] text-white">
                      Notes
                    </TableHead>
                    <TableHead className="font-semibold text-center py-4 w-[8%] text-white">
                      <span className="sr-only">View</span>
                    </TableHead>
                    <TableHead className="font-semibold text-center py-4 w-[8%] text-white">
                      <span className="sr-only">Delete</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>

            <div className="overflow-y-auto flex-1 min-w-[700px]">
              <Table className="table-fixed w-full">
                <TableBody>
                  {isLoading ? (
                    <FollowupsTableSkeleton />
                  ) : followups.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No follow-ups found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    followups.map((followup) => (
                      <FollowupsTableRow
                        key={followup.id}
                        followup={followup}
                        soulName={souls.get(followup.soul_id)?.full_name || "Unknown"}
                        callerName={callers.get(followup.caller_id)?.name || "Unknown"}
                        onViewClick={handleViewClick}
                        onDeleteClick={handleDeleteClick}
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

      {/* Follow-up Modal for editing pending status */}
      {selectedFollowup && callers.get(selectedFollowup.caller_id) && (
        <FollowupModal
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          soul={souls.get(selectedFollowup.soul_id) || null}
          caller={callers.get(selectedFollowup.caller_id)!}
          existingFollowup={selectedFollowup}
          onSuccess={() => {
            fetchFollowups();
            setIsDialogOpen(false);
          }}
        />
      )}

      {/* Read-only Details Dialog for non-pending statuses */}
      <FollowupDetailsDialog
        followup={viewFollowup}
        open={viewDetailsOpen}
        onOpenChange={setViewDetailsOpen}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        loading={isDeleting}
        title="Delete Follow-up"
        description={`Are you sure you want to delete the follow-up for ${
          followupToDelete
            ? souls.get(followupToDelete.soul_id) || "Unknown"
            : "this soul"
        }? This action cannot be undone.`}
        confirmLabel="Delete Follow-up"
      />

      <DeleteConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        onConfirm={handleResetFollowups}
        loading={resetting}
        title="Reset All Follow-ups"
        description="Are you sure you want to delete ALL follow-ups? This will permanently remove all follow-up records from the database and reset all souls' follow-up status. This action cannot be undone."
        confirmLabel="Reset All Follow-ups"
      />
    </Card>
  );
}
