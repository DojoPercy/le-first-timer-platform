import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import LayoutClient from "@/components/layout/LayoutClient";
import { getCurrentActor } from "@/lib/auth/server";

export default async function CallerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { actor } = await getCurrentActor();

  if (!actor) redirect("/");
  if (actor.role === "admin") redirect("/admin");
  if (actor.role === "super_admin") redirect("/superadmin/dashboard");

  return <LayoutClient role="caller">{children}</LayoutClient>;
}
