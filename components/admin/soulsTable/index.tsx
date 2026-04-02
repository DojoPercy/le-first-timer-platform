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
import { PaginationInfo } from "@/components/_reusable_components/pagination-info";
import { SoulDetailsDialog } from "./SoulDetailsDialog";
import { SoulsTableHeader } from "./SoulsTableHeader";
import { SoulsTableRow } from "./SoulsTableRow";
import { SoulsTableSkeleton } from "./SoulsTableSkeleton";
import { useSoulsTable } from "./useSoulsTable";

const ITEMS_PER_PAGE = 10;

export function SoulsTable() {
  const {
    souls,
    callers,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredSoulsCount,
    selectedSoul,
    isDialogOpen,
    setIsDialogOpen,
    handleAssignCaller,
    handleViewDetails,
  } = useSoulsTable();

  return (
    <Card className="border-none shadow-none md:shadow-md md:border pt-2 pb-0">
      <SoulsTableHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <CardContent className="space-y-4 px-0 md:px-6 p">
        <div className="rounded-md border-x-0 md:border-x border-y overflow-hidden relative max-h-[calc(100vh-300px)] flex flex-col">
          <div className="overflow-x-auto">
            <div className="sticky top-0 z-10 bg-background min-w-[800px]">
              <Table className="table-fixed w-full">
                <TableHeader className="bg-[#121D55]">
                  <TableRow>
                    <TableHead className="font-semibold py-4 w-[25%] text-white">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold py-4 w-[15%] text-white">
                      Phone
                    </TableHead>
                    <TableHead className="font-semibold py-4 w-[20%] text-white">
                      Occupation / Status
                    </TableHead>
                    <TableHead className="font-semibold py-4 w-[15%] text-white">
                      Location
                    </TableHead>
                    <TableHead className="font-semibold py-4 w-[20%] text-white">
                      Assigned To
                    </TableHead>
                    <TableHead className="font-semibold text-center py-4 w-[5%] text-white">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
            
            <div className="overflow-y-auto flex-1 min-w-[800px]">
              <Table className="table-fixed w-full">
                <TableBody>
                  {isLoading ? (
                    <SoulsTableSkeleton />
                  ) : souls.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No souls found
                      </TableCell>
                    </TableRow>
                  ) : (
                    souls.map((soul) => (
                      <SoulsTableRow
                        key={soul.id}
                        soul={soul}
                        callers={callers}
                        onAssignCaller={handleAssignCaller}
                        onViewDetails={handleViewDetails}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <SoulDetailsDialog
          soul={selectedSoul}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          callers={callers}
        />

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
              totalItems={filteredSoulsCount}
              itemName="souls"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
