"use client";

import React from "react";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface SideNavHeaderProps {
  role: "superadmin" | "admin" | "caller";
  closeMenu: () => void;
}

export default function SideNavHeader({ role, closeMenu }: SideNavHeaderProps) {
  const basePath =
    role === "superadmin" ? "/superadmin/dashboard" : role === "admin" ? "/admin" : "/caller";

  return (
    <div>
      <Link href={basePath} className="hidden md:block">
        <div className="flex h-15 items-center justify-around bg-[#121D55]">
          <Image src="/logo.png" alt="LE Evangelism Logo" width={120} height={40} className="object-contain" />
        </div>
      </Link>
      <div className="mb-6 flex w-full bg-[#121D55] md:hidden">
        <Link href={basePath} className="block w-full md:hidden">
          <div className="flex h-15 w-full items-center justify-around">
            <Image src="/logo.png" alt="LE Evangelism Logo" width={120} height={40} className="object-contain" />
          </div>
        </Link>
        <button onClick={closeMenu} className="m-2 rounded-lg bg-white p-2 hover:bg-gray-100">
          <X className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
