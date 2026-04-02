"use client";

import { usePathname } from "next/navigation";
import HeaderLeft from "./HeaderLeft";
import HeaderRight from "./HeaderRight";

interface HeaderProps {
  role: "superadmin" | "admin" | "caller";
  onMenuClick?: () => void;
}

export default function Header({ role, onMenuClick }: HeaderProps) {
  const pathname = usePathname();

  const titleMap: Record<string, string> = {
    "/superadmin/dashboard": "Platform Dashboard",
    "/superadmin/branches": "Branches",
    "/superadmin/reports": "Platform Reports",
    "/superadmin/profile": "My Profile",
    "/admin": "Admin Dashboard",
    "/admin/users": "User Management",
    "/admin/first-timers": "First Timers",
    "/admin/followups": "All Follow-ups",
    "/admin/reports": "Monthly Reports",
    "/admin/profile": "My Profile",
    "/caller": "Dashboard",
    "/caller/first-timers": "My First Timers",
    "/caller/followups": "My Follow-ups",
    "/caller/profile": "My Profile",
  };

  const title = titleMap[pathname] || "Dashboard";

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
      <HeaderLeft role={role} title={title} onMenuClick={onMenuClick} />
      <HeaderRight />
    </div>
  );
}
