"use client";

import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { useCallerStore } from "@/lib/store/caller-store";
import { useEffect, useState } from "react";
import { AutoSyncStatus } from "@/components/admin/dashboardStats/AutoSyncStatus";

const roleLabels: Record<string, string> = {
  super_admin: "Superadmin",
  admin: "Admin",
  caller: "Caller",
};

export default function HeaderRight() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, role } = useAuthStore();
  const { currentCaller, fetchCurrentCaller } = useCallerStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (user?.id) {
      fetchCurrentCaller(user.id);
    }
  }, [user, fetchCurrentCaller, pathname]);

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const getProfilePath = () => {
    if (pathname.startsWith("/superadmin")) {
      return "/superadmin/profile";
    }
    if (pathname.startsWith("/admin")) {
      return "/admin/profile";
    }
    if (pathname.startsWith("/caller")) {
      return "/caller/profile";
    }
    return "/";
  };

  if (!isHydrated) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 p-0"
        aria-label="User menu"
        disabled
      >
        <User className="h-5 w-5 text-gray-700" />
      </Button>
    );
  }

  const displayName = currentCaller?.name || user?.email || "User";
  const displayEmail = currentCaller?.email || user?.email;
  const displayRole = currentCaller?.role || role;
  const avatarUrl = currentCaller?.avatar_url;
  const showAutoSyncStatus = pathname.startsWith("/admin");

  return (
    <div className="flex items-center gap-4">
      {showAutoSyncStatus ? <AutoSyncStatus variant="header" /> : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 p-0"
            aria-label="User menu"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-gray-700" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                {displayRole ? (
                  <Badge className="px-2 py-0.5 text-xs">{roleLabels[displayRole] || displayRole}</Badge>
                ) : null}
              </div>
              <p className="text-xs leading-none text-muted-foreground">{displayEmail}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(getProfilePath())} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>View Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
