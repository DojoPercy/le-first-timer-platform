import { NextResponse } from "next/server";
import { getCurrentActor, isAdminLike, resolveBranchScope } from "@/lib/auth/server";
import {
  assignAllUnassignedFirstTimers,
  redistributeAllFirstTimers,
} from "@/lib/utils/assign-caller";

export async function POST(request: Request) {
  const { actor } = await getCurrentActor();
  if (!actor || !isAdminLike(actor)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const branchId = resolveBranchScope(actor, body?.branchId || null);
  const redistribute = Boolean(body?.redistribute);

  const result = redistribute
    ? await redistributeAllFirstTimers(branchId)
    : await assignAllUnassignedFirstTimers(branchId);

  return NextResponse.json(result);
}
