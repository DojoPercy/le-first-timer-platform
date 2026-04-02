import React from "react";
import { BranchWithRelations } from "@/components/super-admin/branch-management";

export function BranchInfoCell({ branch }: { branch: BranchWithRelations }) {
  return (
    <div className="min-w-[140px]">
      <span className="block truncate text-sm font-semibold text-foreground" title={branch.name}>
        {branch.name}
      </span>
    </div>
  );
}
