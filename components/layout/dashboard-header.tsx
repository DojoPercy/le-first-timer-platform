"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function DashboardHeader({ onMenuClick, title }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4 md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="mr-2"
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      {title && <h1 className="text-lg font-semibold">{title}</h1>}
    </header>
  );
}
