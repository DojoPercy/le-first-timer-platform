import React from "react";
import { User2 } from "lucide-react";
import { BranchWithRelations } from "@/components/super-admin/branch-management";

export function BranchAdminCell({ admin }: { admin: BranchWithRelations["branch_admin"] }) {
  return (
    <div className="flex items-center gap-2 min-w-47.5">
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-200 text-slate-600 font-bold text-xs uppercase">
        {admin?.name
          ? admin.name.split(" ").map((n) => n[0]).join("")
          : <User2 className="h-4 w-4 text-slate-400" />}
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-foreground truncate max-w-27.5" title={admin?.name || "No branch admin"}>{admin?.name || "No branch admin"}</span>
        <span className="text-xs text-muted-foreground truncate max-w-27.5" title={admin?.email || "No branch admin linked yet"}>{admin?.email || "No branch admin linked yet"}</span>
      </div>
    </div>
  );
}
