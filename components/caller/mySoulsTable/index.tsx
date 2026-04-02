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
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Soul } from "@/lib/types";
import { SoulDetailsDialog } from "@/components/admin/soulsTable/SoulDetailsDialog";
import { MySoulsTableHeader } from "./MySoulsTableHeader";
import { MySoulsTableRow } from "./MySoulsTableRow";
import { MySoulsTableSkeleton } from "./MySoulsTableSkeleton";
import { useMySoulsTable } from "./useMySoulsTable";

interface MySoulsTableProps {
  callerId: string;
  onSelectSoul: (soul: Soul) => void;
}

export function MySoulsTable({ callerId, onSelectSoul }: MySoulsTableProps) {
  const {
    souls,
    paginatedSouls,
    followups,
    isLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    selectedSoul,
    setSelectedSoul,
    isDialogOpen,
    setIsDialogOpen,
    callers,
  } = useMySoulsTable(callerId);

  return (
    <TooltipProvider>
      <Card className="border-none shadow-none md:shadow-md md:border pt-2 pb-0 w-full max-w-full">
        <MySoulsTableHeader soulsCount={souls.length} />
        
        <CardContent className="px-0 md:px-6 w-full">
          {isLoading ? (
            <div className="rounded-md border-x-0 md:border-x border-y overflow-hidden relative h-[calc(100vh-200px)] flex flex-col w-full">
              <div className="overflow-x-auto">
                <div className="sticky top-0 z-10 bg-background min-w-[700px]">
                  <Table className="table-fixed w-full">
                    <TableHeader className="bg-[#121D55]">
                      <TableRow>
                        <TableHead className="font-semibold py-4 w-[25%] text-white">Name</TableHead>
                        <TableHead className="font-semibold py-4 w-[15%] text-white">Phone</TableHead>
                        <TableHead className="font-semibold py-4 w-[20%] text-white">Occupation / Status</TableHead>
                        <TableHead className="font-semibold py-4 w-[15%] text-white">Status</TableHead>
                        <TableHead className="font-semibold py-4 w-[15%] text-white">Action</TableHead>
                        <TableHead className="font-semibold text-center py-4 w-[5%] text-white">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>
                <div className="overflow-y-auto flex-1 min-w-[700px]">
                  <Table className="table-fixed w-full">
                    <TableBody>
                      <MySoulsTableSkeleton />
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ) : souls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No souls assigned yet
            </div>
          ) : (
            <div className="rounded-md border-x-0 md:border-x border-y overflow-hidden relative h-[calc(100vh-200px)] flex flex-col w-full">
              <div className="overflow-x-auto">
                <div className="sticky top-0 z-10 bg-background min-w-[700px]">
                  <Table className="table-fixed w-full">
                    <TableHeader className="bg-[#121D55]">
                      <TableRow>
                        <TableHead className="font-semibold py-4 w-[25%] text-white">Name</TableHead>
                        <TableHead className="font-semibold py-4 w-[15%] text-white">Phone</TableHead>
                        <TableHead className="font-semibold py-4 w-[20%] text-white">Occupation / Status</TableHead>
                        <TableHead className="font-semibold py-4 w-[15%] text-white">Status</TableHead>
                        <TableHead className="font-semibold py-4 w-[15%] text-white">Action</TableHead>
                        <TableHead className="font-semibold text-center py-4 w-[5%] text-white">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>
                <div className="overflow-y-auto flex-1 min-h-0 min-w-[700px]">
                  <Table className="table-fixed w-full">
                    <TableBody>
                      {paginatedSouls.map((soul) => (
                        <MySoulsTableRow
                          key={soul.id}
                          soul={soul}
                          followups={followups}
                          callerId={callerId}
                          onSelectSoul={onSelectSoul}
                          onViewDetails={(soul) => {
                            setSelectedSoul(soul);
                            setIsDialogOpen(true);
                          }}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="sticky bottom-0 bg-background border-t pt-4 pb-2 mt-4 px-4 md:px-0 flex flex-col items-center gap-4 z-10">
              <Pagination
                current={currentPage}
                total={totalPages}
                onChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <SoulDetailsDialog
        soul={selectedSoul}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        callers={callers}
      />
    </TooltipProvider>
  );
}
