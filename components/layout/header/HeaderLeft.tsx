"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActiveBranchBadge } from "@/components/shared/ActiveBranchBadge";

interface HeaderLeftProps {
  role: "superadmin" | "admin" | "caller";
  title: string;
  onMenuClick?: () => void;
}

export default function HeaderLeft({ role, title, onMenuClick }: HeaderLeftProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
      <h2 className="truncate text-sm font-semibold text-gray-800 sm:text-base md:text-lg">{title}</h2>
      {role !== "superadmin" ? <ActiveBranchBadge /> : null}
    </div>
  );
}
