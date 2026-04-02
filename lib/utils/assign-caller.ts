import { createClient } from "@/lib/supabase/server";

export async function getLeastLoadedCaller(branchId?: string | null): Promise<string | null> {
  const supabase = await createClient();
  let callersQuery = supabase
    .from("callers")
    .select("id")
    .eq("role", "caller");

  if (branchId) {
    callersQuery = callersQuery.eq("branch_id", branchId);
  }

  const { data: callers } = await callersQuery;
  if (!callers || callers.length === 0) return null;

  const firstTimerCounts: Record<string, number> = {};
  for (const caller of callers) {
    let countQuery = supabase
      .from("first_timers")
      .select("id", { count: "exact", head: true })
      .eq("assigned_caller_id", caller.id);
    if (branchId) {
      countQuery = countQuery.eq("branch_id", branchId);
    }
    const { count } = await countQuery;
    firstTimerCounts[caller.id] = count || 0;
  }

  let minCount = Infinity;
  let selectedCallerId: string | null = null;
  for (const callerId of Object.keys(firstTimerCounts)) {
    if (firstTimerCounts[callerId] < minCount) {
      minCount = firstTimerCounts[callerId];
      selectedCallerId = callerId;
    }
  }
  return selectedCallerId;
}

/**
 * Assigns all unassigned first timers to available callers.
 * Algorithm mirrors Google Apps Script logic:
 * 1. Count existing assignments for each caller
 * 2. For each unassigned first timer, find the caller with the least count
 * 3. Assign to that caller and increment the count
 * 4. This ensures perfectly even distribution
 */
export async function assignAllUnassignedFirstTimers(branchId?: string | null): Promise<{
  assigned: number;
  errors: number;
}> {
  const supabase = await createClient();

  let callersQuery = supabase
    .from("callers")
    .select("id, name, role")
    .eq("role", "caller");
  if (branchId) {
    callersQuery = callersQuery.eq("branch_id", branchId);
  }
  const { data: callers } = await callersQuery;

  console.log("=== ASSIGNMENT DEBUG START ===");
  console.log(
    "Callers found:",
    callers?.map((c) => ({ id: c.id, name: c.name, role: c.role }))
  );

  if (!callers || callers.length === 0) {
    console.log("No callers available for assignment");
    return { assigned: 0, errors: 0 };
  }

  let allFirstTimersQuery = supabase
    .from("first_timers")
    .select("id, assigned_caller_id");
  if (branchId) {
    allFirstTimersQuery = allFirstTimersQuery.eq("branch_id", branchId);
  }
  const { data: allFirstTimers } = await allFirstTimersQuery;

  console.log(`Total first timers in database: ${allFirstTimers?.length || 0}`);

  let allCallersQuery = supabase
    .from("callers")
    .select("id, name, role");
  if (branchId) {
    allCallersQuery = allCallersQuery.eq("branch_id", branchId);
  }
  const { data: allCallers } = await allCallersQuery;

  const adminIds = (allCallers || [])
    .filter((c) => c.role === "admin")
    .map((c) => c.id);

  const callerIds = callers.map((c) => c.id);

  console.log("Admin IDs:", adminIds);
  console.log("Caller IDs:", callerIds);

  if (adminIds.length > 0) {
    let adminAssignedQuery = supabase
      .from("first_timers")
      .select("id", { count: "exact", head: false })
      .in("assigned_caller_id", adminIds);
    if (branchId) {
      adminAssignedQuery = adminAssignedQuery.eq("branch_id", branchId);
    }
    const { data: firstTimersAssignedToAdmins, count: adminFirstTimersCount } =
      await adminAssignedQuery;

    console.log(`First timers assigned to admins: ${adminFirstTimersCount || 0}`);
    if (firstTimersAssignedToAdmins && firstTimersAssignedToAdmins.length > 0) {
      console.log("Unassigning first timers from admins...");
      const { error: unassignError } = await supabase
        .from("first_timers")
        .update({ assigned_caller_id: null })
        .in(
          "id",
          firstTimersAssignedToAdmins.map((s) => s.id)
        );

      if (unassignError) {
        console.error("Error unassigning from admins:", unassignError);
      } else {
        console.log(
          `Successfully unassigned ${firstTimersAssignedToAdmins.length} first timers from admins`
        );
      }
    }
  }

  let unassignedQuery = supabase
    .from("first_timers")
    .select("id")
    .is("assigned_caller_id", null);
  if (branchId) {
    unassignedQuery = unassignedQuery.eq("branch_id", branchId);
  }
  const { data: unassignedFirstTimers, error: fetchError } = await unassignedQuery;

  if (fetchError) {
    console.error("Error fetching unassigned first timers:", fetchError);
    return { assigned: 0, errors: 0 };
  }

  console.log(`Unassigned first timers found: ${unassignedFirstTimers?.length || 0}`);

  if (!unassignedFirstTimers || unassignedFirstTimers.length === 0) {
    console.log("No unassigned first timers to assign");
    console.log("=== ASSIGNMENT DEBUG END ===");
    return { assigned: 0, errors: 0 };
  }

  const counts: Record<string, number> = {};
  for (const caller of callers) {
    let countQuery = supabase
      .from("first_timers")
      .select("id", { count: "exact", head: true })
      .eq("assigned_caller_id", caller.id);
    if (branchId) {
      countQuery = countQuery.eq("branch_id", branchId);
    }
    const { count } = await countQuery;
    counts[caller.id] = count || 0;
  }

  console.log("Current caller assignments:", counts);
  console.log(`Found ${unassignedFirstTimers.length} unassigned first timers to assign`);

  let assigned = 0;
  let errors = 0;

  let updatedUnassignedQuery = supabase
    .from("first_timers")
    .select("id")
    .is("assigned_caller_id", null);
  if (branchId) {
    updatedUnassignedQuery = updatedUnassignedQuery.eq("branch_id", branchId);
  }
  const { data: updatedUnassignedFirstTimers } = await updatedUnassignedQuery;

  const firstTimersToAssign = updatedUnassignedFirstTimers || unassignedFirstTimers;

  if (firstTimersToAssign.length === 0) {
    console.log("No unassigned first timers to assign after cleanup");
    return { assigned: 0, errors: 0 };
  }

  console.log(`Assigning ${firstTimersToAssign.length} unassigned first timers to callers`);

  for (const firstTimer of firstTimersToAssign) {
    if (Object.keys(counts).length === 0) {
      console.error("No callers available for assignment");
      break;
    }

    const leastLoadedCallerId = Object.keys(counts).reduce((a, b) =>
      counts[a] < counts[b] ? a : b
    );

    const isValidCaller = callers.some((c) => c.id === leastLoadedCallerId);
    if (!isValidCaller) {
      console.error(
        `Invalid caller ID ${leastLoadedCallerId} - skipping assignment`
      );
      errors++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("first_timers")
      .update({ assigned_caller_id: leastLoadedCallerId })
      .eq("id", firstTimer.id);

    if (updateError) {
      console.error(
        `Error assigning first timer ${firstTimer.id} to caller ${leastLoadedCallerId}:`,
        updateError
      );
      errors++;
    } else {
      assigned++;
      counts[leastLoadedCallerId] = (counts[leastLoadedCallerId] || 0) + 1;
    }
  }

  if (assigned > 0) {
    console.log(
      `Successfully assigned ${assigned} first timers. New distribution:`,
      counts
    );
  }

  return { assigned, errors };
}

/**
 * Redistributes ALL first timers evenly across all available callers.
 */
export async function redistributeAllFirstTimers(branchId?: string | null): Promise<{
  assigned: number;
  errors: number;
}> {
  const supabase = await createClient();

  let callersQuery = supabase
    .from("callers")
    .select("id, name, role")
    .eq("role", "caller");
  if (branchId) {
    callersQuery = callersQuery.eq("branch_id", branchId);
  }
  const { data: callers } = await callersQuery;

  console.log("=== REDISTRIBUTION DEBUG START ===");
  console.log(
    "Callers found:",
    callers?.map((c) => ({ id: c.id, name: c.name, role: c.role }))
  );

  if (!callers || callers.length === 0) {
    console.log("No callers available for redistribution");
    return { assigned: 0, errors: 0 };
  }

  let allFirstTimersQuery = supabase.from("first_timers").select("id");
  if (branchId) {
    allFirstTimersQuery = allFirstTimersQuery.eq("branch_id", branchId);
  }
  const { data: allFirstTimers } = await allFirstTimersQuery;

  console.log(`Total first timers to redistribute: ${allFirstTimers?.length || 0}`);

  if (!allFirstTimers || allFirstTimers.length === 0) {
    console.log("No first timers to redistribute");
    return { assigned: 0, errors: 0 };
  }

  console.log("Unassigning all first timers...");
  let unassignQuery = supabase
    .from("first_timers")
    .update({ assigned_caller_id: null })
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (branchId) {
    unassignQuery = unassignQuery.eq("branch_id", branchId);
  }
  const { error: unassignError } = await unassignQuery;

  if (unassignError) {
    console.error("Error unassigning first timers:", unassignError);
    return { assigned: 0, errors: 0 };
  }

  console.log(`Successfully unassigned ${allFirstTimers.length} first timers`);

  const counts: Record<string, number> = {};
  for (const caller of callers) {
    counts[caller.id] = 0;
  }

  console.log("Initial caller counts:", counts);

  let assigned = 0;
  let errors = 0;

  const assignmentsByCaller: Record<string, string[]> = {};
  for (const caller of callers) {
    assignmentsByCaller[caller.id] = [];
  }

  for (const firstTimer of allFirstTimers) {
    const leastLoadedCallerId = Object.keys(counts).reduce((a, b) =>
      counts[a] < counts[b] ? a : b
    );

    assignmentsByCaller[leastLoadedCallerId].push(firstTimer.id);
    counts[leastLoadedCallerId]++;
    assigned++;
  }

  for (const callerId of Object.keys(assignmentsByCaller)) {
    const firstTimerIds = assignmentsByCaller[callerId];
    if (firstTimerIds.length === 0) continue;

    const { error: updateError } = await supabase
      .from("first_timers")
      .update({ assigned_caller_id: callerId })
      .in("id", firstTimerIds);

    if (updateError) {
      console.error(
        `Error bulk assigning first timers to caller ${callerId}:`,
        updateError
      );
      errors += firstTimerIds.length;
      assigned -= firstTimerIds.length;
    }
  }

  console.log(
    `Successfully redistributed ${assigned} first timers. Final distribution:`,
    counts
  );
  console.log("=== REDISTRIBUTION DEBUG END ===");

  return { assigned, errors };
}
