"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

interface AppShellProps {
  title: string;
  subtitle: string;
  actorName: string;
  links: NavItem[];
  children: ReactNode;
}

export function AppShell({
  title,
  subtitle,
  actorName,
  links,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:block">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              First Timer Platform
            </p>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>

          <nav className="mt-8 space-y-2">
            {links.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl bg-slate-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Signed in
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">{actorName}</p>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-4 w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 border-b border-slate-100 pb-6 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                First Timer Platform
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {links.map((link) => {
                  const isActive =
                    pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium",
                        isActive
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
