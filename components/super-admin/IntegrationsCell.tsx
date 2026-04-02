import React from "react";
import { Badge } from "@/components/ui/badge";
import { BranchWithRelations, formatTimestamp, getIntegration, statusBadgeClass } from "@/components/super-admin/branch-management";

export function IntegrationsCell({ branch }: { branch: BranchWithRelations }) {
  const soulsIntegration = getIntegration(branch, "souls_intake");
  const mcIntegration = getIntegration(branch, "mc_evangelism");
  const integrationBadges = [
    soulsIntegration ? { label: "Souls", badgeClass: statusBadgeClass(soulsIntegration.status) } : null,
    mcIntegration ? { label: "MC", badgeClass: statusBadgeClass(mcIntegration.status) } : null,
  ].filter(Boolean) as Array<{ label: string; badgeClass: string }>;

  const lastSync = soulsIntegration?.last_synced_at || mcIntegration?.last_synced_at || null;

  return (
    <div className="flex min-w-[150px] flex-col gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        {integrationBadges.length > 0 ? (
          integrationBadges.map((integration) => (
            <Badge
              key={integration.label}
              variant="outline"
              className={`${integration.badgeClass} px-2 py-0.5 text-[10px] font-semibold`}
            >
              {integration.label}
            </Badge>
          ))
        ) : (
          <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-semibold">
            None
          </Badge>
        )}
      </div>
      <span
        className="truncate text-[11px] text-muted-foreground"
        title={lastSync ? `Synced ${formatTimestamp(lastSync)}` : "Pending sync"}
      >
        {lastSync ? formatTimestamp(lastSync) : "Pending sync"}
      </span>
    </div>
  );
}
