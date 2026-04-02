"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface SideNavLinkProps {
  title: string;
  icon: LucideIcon;
  url: string;
  isActive: boolean;
  onClick?: () => void;
}

export default function SideNavLink({ title, icon: Icon, url, isActive, onClick }: SideNavLinkProps) {
  return (
    <Link
      href={url}
      onClick={onClick}
      className={`mx-4 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
        isActive ? "border-l-4 border-blue-500 bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-blue-50"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{title}</span>
    </Link>
  );
}
