"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type SessionPayload = {
  authenticated: boolean;
  branch?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export function ActiveBranchBadge() {
  const [branchName, setBranchName] = useState<string | null>(null);

  useEffect(() => {
    const loadBranch = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as SessionPayload | null;

        if (response.ok && payload?.authenticated && payload?.branch?.name) {
          setBranchName(payload.branch.name);
          return;
        }

        setBranchName(null);
      } catch {
        setBranchName(null);
      }
    };

    loadBranch();
  }, []);

  if (!branchName) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className="gap-1 border-[#c7d2fe] bg-[#eef2ff] px-3 py-1 text-[#1e3a8a]"
    >
      <Building2 className="h-3.5 w-3.5" />
      {branchName}
    </Badge>
  );
}
