import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import LayoutClient from "@/components/layout/LayoutClient";
import { getCurrentActor } from "@/lib/auth/server";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { actor } = await getCurrentActor();

  if (!actor) redirect("/");
  if (actor.role === "caller") redirect("/caller");
  if (actor.role === "super_admin") redirect("/superadmin/dashboard");

  return <LayoutClient role="admin">{children}</LayoutClient>;
}
