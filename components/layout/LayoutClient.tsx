"use client";

import React, { ReactNode, useState } from "react";
import SideNav from "@/components/layout/sidebar/sideNav";
import Header from "@/components/layout/header/Header";
import { AdminAutoSyncController } from "@/components/admin/AdminAutoSyncController";

interface LayoutClientProps {
  children: ReactNode;
  role: "superadmin" | "admin" | "caller";
}

export default function LayoutClient({ children, role }: LayoutClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-gray-100 md:flex-row">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-white shadow-lg transition-transform duration-300 ease-in-out md:static md:w-64 md:shrink-0 md:translate-x-0 lg:w-72 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SideNav role={role} closeMenu={() => setIsOpen(false)} />
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setIsOpen(false)} />
      ) : null}

      <div className="flex min-w-0 w-full flex-col">
        {role === "admin" ? <AdminAutoSyncController /> : null}
        <Header role={role} onMenuClick={() => setIsOpen(true)} />
        <main className="grow overflow-y-auto p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
