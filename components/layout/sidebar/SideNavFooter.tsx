"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

export default function SideNavFooter() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="mb-4 px-4">
      <Button
        variant="ghost"
        onClick={handleSignOut}
        className="flex w-full cursor-pointer items-center justify-start gap-3 rounded-md bg-transparent p-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-600 focus:bg-red-50 active:bg-red-100"
      >
        <LogOut className="h-5 w-5" />
        Sign Out
      </Button>
    </div>
  );
}
