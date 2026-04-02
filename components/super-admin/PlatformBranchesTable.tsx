"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlatformBranchSummary } from "@/lib/super-admin/platform-summary-types";

interface PlatformBranchesTableProps {
  branches: PlatformBranchSummary[];
}

export function PlatformBranchesTable({ branches }: PlatformBranchesTableProps) {
  const rows = [...branches].sort((a, b) => b.souls - a.souls);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branch Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No branches found yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Souls Won</TableHead>
                <TableHead>Integrations</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell>
                    <div className="min-w-[180px]">
                      <p className="font-medium text-foreground">{branch.name}</p>
                      <p className="text-xs text-muted-foreground">/{branch.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={branch.status === "active" ? "default" : "outline"}
                      className={branch.status === "active" ? "bg-green-600 text-white" : ""}
                    >
                      {branch.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{branch.souls.toLocaleString()}</TableCell>
                  <TableCell>{branch.integrations.toLocaleString()}</TableCell>
                  <TableCell>
                    {branch.yearTarget ? branch.yearTarget.toLocaleString() : "-"}
                  </TableCell>
                  <TableCell>
                    {branch.yearTarget ? (
                      <div className="flex min-w-[160px] items-center gap-2">
                        <Progress value={branch.progressPercentage} className="h-2 flex-1" />
                        <span className="text-xs font-medium text-primary">
                          {branch.progressPercentage.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No target</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
