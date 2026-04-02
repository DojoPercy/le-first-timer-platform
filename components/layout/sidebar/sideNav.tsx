"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Home, Heart, Users, CheckCircle, User, FileText, TrendingUp, BarChart3 } from "lucide-react";
import SideNavHeader from "./SideNavHeader";
import SideNavLink from "./SideNavLink";
import SideNavFooter from "./SideNavFooter";

interface SideNavProps {
  role: "superadmin" | "admin" | "caller";
  closeMenu: () => void;
}

const navItemsByRole = {
  superadmin: [
    { title: "Dashboard", icon: Home, url: "/superadmin/dashboard" },
    { title: "Branches", icon: Users, url: "/superadmin/branches" },
    { title: "Reports", icon: FileText, url: "/superadmin/reports" },
    { title: "Profile", icon: User, url: "/superadmin/profile" },
  ],
  admin: [
    { title: "Dashboard", icon: Home, url: "/admin" },
    { title: "First Timers", icon: Heart, url: "/admin/first-timers" },
    { title: "Users", icon: Users, url: "/admin/users" },
    { title: "Follow-ups", icon: CheckCircle, url: "/admin/followups" },
    { title: "Follow-ups Summary", icon: BarChart3, url: "/admin/followups-summary" },
    { title: "Reports", icon: FileText, url: "/admin/reports" },
    { title: "Profile", icon: User, url: "/admin/profile" },
  ],
  caller: [
    { title: "Dashboard", icon: Home, url: "/caller" },
    { title: "My First Timers", icon: Heart, url: "/caller/first-timers" },
    { title: "My Follow-ups", icon: CheckCircle, url: "/caller/followups" },
    { title: "Profile", icon: User, url: "/caller/profile" },
  ],
} as const;

export default function SideNav({ role, closeMenu }: SideNavProps) {
  const pathname = usePathname();
  const navItems = navItemsByRole[role];

  return (
    <div className="flex h-full flex-col bg-white py-0">
      <SideNavHeader role={role} closeMenu={closeMenu} />

      <div className="mt-4 flex grow flex-col gap-1">
        {navItems.map(({ title, icon, url }) => (
          <SideNavLink
            key={title}
            title={title}
            icon={icon}
            url={url}
            isActive={pathname === url}
            onClick={closeMenu}
          />
        ))}
      </div>

      <SideNavFooter />
    </div>
  );
}
