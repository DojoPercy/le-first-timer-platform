import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import LayoutClient from "@/components/layout/LayoutClient";
import { getCurrentActor } from "@/lib/auth/server";

export default async function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { actor } = await getCurrentActor();

  if (!actor) redirect("/");
  if (actor.role === "admin") redirect("/admin");
  if (actor.role === "caller") redirect("/caller");

  return <LayoutClient role="superadmin">{children}</LayoutClient>;
}
