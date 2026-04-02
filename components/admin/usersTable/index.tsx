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
import { UsersTableHeader } from "./UsersTableHeader";
import { UsersTableRow } from "./UsersTableRow";
import { UsersTableSkeleton } from "./UsersTableSkeleton";
import { useUsersTable } from "./useUsersTable";

const ITEMS_PER_PAGE = 10;

export function UsersTable() {
  const {
    users,
    isLoading,
    isHydrated,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredUsersCount,
    soulCounts,
    loadingCounts,
    deleteDialogOpen,
    setDeleteDialogOpen,
    userToDelete,
    isDeleting,
    handleDeleteClick,
    confirmDelete,
    fetchCallers,
  } = useUsersTable();

  return (
    <Card className="border-none shadow-none md:shadow-md md:border">
      <UsersTableHeader
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        isHydrated={isHydrated}
        onSearchChange={setSearchTerm}
        onRoleFilterChange={setRoleFilter}
        onUserCreated={fetchCallers}
      />

      <CardContent className="space-y-4 px-0 md:px-6 pb-4">
        <div className="rounded-md border-x-0 md:border-x border-y overflow-hidden relative max-h-[calc(100vh-300px)] flex flex-col">
          <div className="overflow-x-auto">
            <div className="sticky top-0 z-10 bg-background min-w-[700px]">
              <Table className="table-fixed w-full">
                <TableHeader className="bg-[#121D55]">
                  <TableRow>
                    <TableHead className="font-semibold py-4 w-[30%] text-white">
                      User
                    </TableHead>
                    <TableHead className="font-semibold py-4 w-[12%] text-white">
                      Role
                    </TableHead>
                    <TableHead className="font-semibold py-4 w-[30%] text-white">
                      Email
                    </TableHead>
                    <TableHead className="font-semibold text-center py-4 w-[15%] text-white">
                      Souls Assigned
                    </TableHead>
                    <TableHead className="font-semibold text-center py-4 w-[13%] text-white">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>

            <div className="overflow-y-auto flex-1 min-w-[700px]">
              <Table className="table-fixed w-full">
                <TableBody>
                  {isLoading ? (
                    <UsersTableSkeleton />
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No users found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <UsersTableRow
                        key={user.id}
                        user={user}
                        soulCount={soulCounts[user.id] || 0}
                        loadingCounts={loadingCounts}
                        onDelete={handleDeleteClick}
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
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsersCount)} of{" "}
              {filteredUsersCount} users
            </p>
          </div>
        )}
      </CardContent>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        loading={isDeleting}
        title="Delete User"
        description={`Are you sure you want to delete user ${userToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete User"
      />
    </Card>
  );
}
