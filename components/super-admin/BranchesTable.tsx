"use client";

import { PencilLine, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BranchAdminCell } from "@/components/super-admin/BranchAdminCell";
import { BranchInfoCell } from "@/components/super-admin/BranchInfoCell";
import { IntegrationsCell } from "@/components/super-admin/IntegrationsCell";
import type { BranchWithRelations } from "@/components/super-admin/branch-management";

interface BranchesTableProps {
  branches: BranchWithRelations[];
  isLoading: boolean;
  onEdit: (branch: BranchWithRelations) => void;
  onDelete: (branch: BranchWithRelations) => void;
}

const columns = [
  { label: "Branch", className: "w-[180px]" },
  { label: "Branch Admin", className: "w-[240px]" },
  { label: "Souls", className: "w-[80px] text-center" },
  { label: "Users", className: "w-[80px] text-center" },
  { label: "Integrations", className: "w-[170px]" },
  { label: "Status", className: "w-[100px]" },
  { label: "Actions", className: "w-[90px] text-right" },
] as const;

export function BranchesTable({
  branches,
  isLoading,
  onEdit,
  onDelete,
}: BranchesTableProps) {
  return (
    <Card className="overflow-hidden border border-slate-200 py-0 shadow-sm dark:border-slate-800">
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-6 w-6" />
          </div>
        ) : branches.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No branches found yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 dark:bg-slate-900/40">
                {columns.map((column) => (
                  <TableHead key={column.label} className={`h-10 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ${column.className}`}>
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => {
                const canDelete = branch.slug !== "alpha";

                return (
                  <TableRow
                    key={branch.id}
                    className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-900/40"
                  >
                    <TableCell className="py-3">
                      <BranchInfoCell branch={branch} />
                    </TableCell>
                    <TableCell className="py-3">
                      <BranchAdminCell admin={branch.branch_admin} />
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">
                        {branch.souls_count ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {branch.callers_count ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <IntegrationsCell branch={branch} />
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant={branch.status === "active" ? "default" : "outline"}
                        className={
                          branch.status === "active"
                            ? "bg-green-600 px-2.5 py-0.5 text-[10px] font-semibold text-white"
                            : "px-2.5 py-0.5 text-[10px] font-semibold"
                        }
                      >
                        {branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEdit(branch)}
                          title="Edit branch"
                          className="h-8 w-8 hover:bg-indigo-50"
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDelete(branch)}
                          disabled={!canDelete}
                          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-600"
                          title={canDelete ? "Delete branch" : "Alpha cannot be deleted"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
