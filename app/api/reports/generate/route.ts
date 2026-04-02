import { NextRequest, NextResponse } from 'next/server';
import { generateReportBlob, type ReportData } from '@/lib/utils/pdf-generator';
import { createClient } from '@/lib/supabase/server';
import type { FirstTimer } from '@/lib/types';
import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const generateReportSchema = z
  .object({
    period: z.string(),
    reportType: z.enum(['weekly', 'monthly', 'yearly']),
    year: z.number(),
    month: z.number().optional(),
    week: z.number().optional(),
    includeFirstTimers: z.boolean().default(true),
    includeFollowups: z.boolean().default(true),
    format: z.enum(['pdf', 'csv']).default('pdf'),
    branchId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.reportType === 'weekly') {
      if (data.month == null || data.month < 1 || data.month > 12) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Month is required for weekly reports (week is interpreted within that month)',
          path: ['month'],
        });
      }
      if (data.week == null || data.week < 1 || data.week > 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Week must be between 1 and 5 for weekly reports',
          path: ['week'],
        });
      }
    }
    if (data.reportType === 'monthly' && (data.month == null || data.month < 1 || data.month > 12)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Month is required for monthly reports',
        path: ['month'],
      });
    }
  });

/**
 * Weekly = week index 1–5 within the selected calendar month (7-day bands: 1–7, 8–14, …, 29–end).
 * Monthly/yearly use full calendar bounds in UTC.
 */
function getDateRange(
  reportType: 'weekly' | 'monthly' | 'yearly',
  year: number,
  month?: number,
  week?: number
) {
  if (reportType === 'weekly') {
    const safeMonth = Math.min(Math.max(month ?? 1, 1), 12);
    const safeWeek = Math.min(Math.max(week ?? 1, 1), 5);
    const daysInMonth = new Date(Date.UTC(year, safeMonth, 0)).getUTCDate();
    const startDay = (safeWeek - 1) * 7 + 1;
    const endDay = Math.min(safeWeek * 7, daysInMonth);
    const startDate = new Date(Date.UTC(year, safeMonth - 1, startDay, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, safeMonth - 1, endDay, 23, 59, 59, 999));
    return { startDate, endDate };
  }

  if (reportType === 'monthly') {
    const safeMonth = Math.min(Math.max(month ?? 1, 1), 12);
    const startDate = new Date(Date.UTC(year, safeMonth - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, safeMonth, 0, 23, 59, 59, 999));
    return { startDate, endDate };
  }

  const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
  return { startDate, endDate };
}

/**
 * Effective "first timer date" for reporting: form submission / visit time when set, otherwise when the row was created.
 */
async function fetchFirstTimersInDateRange(
  supabase: SupabaseServerClient,
  startDateStr: string,
  endDateStr: string,
  branchId?: string
) {
  let withVisitDate = supabase
    .from('first_timers')
    .select('*')
    .not('form_submitted_at', 'is', null)
    .gte('form_submitted_at', startDateStr)
    .lte('form_submitted_at', endDateStr)
    .order('created_at', { ascending: false });

  let createdOnly = supabase
    .from('first_timers')
    .select('*')
    .is('form_submitted_at', null)
    .gte('created_at', startDateStr)
    .lte('created_at', endDateStr)
    .order('created_at', { ascending: false });

  if (branchId) {
    withVisitDate = withVisitDate.eq('branch_id', branchId);
    createdOnly = createdOnly.eq('branch_id', branchId);
  }

  const [visitRows, createdRows] = await Promise.all([withVisitDate, createdOnly]);

  if (visitRows.error) return { data: null, error: visitRows.error };
  if (createdRows.error) return { data: null, error: createdRows.error };

  const byId = new Map<string, FirstTimer>();
  for (const row of visitRows.data ?? []) {
    byId.set(row.id, row as FirstTimer);
  }
  for (const row of createdRows.data ?? []) {
    byId.set(row.id, row as FirstTimer);
  }

  const merged = Array.from(byId.values());
  merged.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return { data: merged, error: null };
}

async function getLogoDataUrl() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoBuffer = await readFile(logoPath);
    return `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Failed to load logo for PDF branding:', error);
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateReportSchema.parse(body);
    
    const supabase = await createClient();
    
    // Get branch information
    let branchName = 'Main Branch';
    if (validatedData.branchId) {
      const { data: branch } = await supabase
        .from('branches')
        .select('name')
        .eq('id', validatedData.branchId)
        .single();
      
      if (branch) {
        branchName = branch.name;
      }
    }

    const { startDate, endDate } = getDateRange(
      validatedData.reportType,
      validatedData.year,
      validatedData.month,
      validatedData.week
    );

    // Format dates for database queries
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    // Fetch report data for the specified period
    const reportData: ReportData = {
      period: validatedData.period,
      branchName,
      generatedAt: new Date(),
      logoDataUrl: validatedData.format === 'pdf' ? await getLogoDataUrl() : undefined,
      stats: {
        totalFirstTimers: 0,
        assignedFirstTimers: 0,
        unassignedFirstTimers: 0,
        fullyJoinedCount: 0,
        joiningCount: 0,
        visitingCount: 0,
        followedUpThisWeekCount: 0,
        pendingFollowupThisWeekCount: 0,
        totalFollowups: 0,
        followupsContacted: 0,
        completionRate: 0,
      },
      topCells: [],
      topInviters: [],
      callerPerformance: [],
      firstTimers: [],
      followups: [],
    };

    // First timers: filter by visit/intake date when present (form_submitted_at), else record created_at
    if (validatedData.includeFirstTimers) {
      const { data: firstTimers, error: firstTimersError } = await fetchFirstTimersInDateRange(
        supabase,
        startDateStr,
        endDateStr,
        validatedData.branchId
      );

      if (firstTimersError) {
        console.error('Error fetching first timers:', firstTimersError);
        return NextResponse.json(
          { error: 'Failed to fetch first timers data' },
          { status: 500 }
        );
      }

      if (firstTimers) {
        reportData.firstTimers = firstTimers;
        reportData.stats.totalFirstTimers = firstTimers.length;
        reportData.stats.assignedFirstTimers = firstTimers.filter(ft => ft.assigned_caller_id).length;
        reportData.stats.unassignedFirstTimers = firstTimers.filter(ft => !ft.assigned_caller_id).length;
        reportData.stats.fullyJoinedCount = firstTimers.filter(ft => ft.followup_outcome_status === 'fully_joined').length;
        reportData.stats.joiningCount = firstTimers.filter(ft => ft.visit_type?.includes('JOINING')).length;
        reportData.stats.visitingCount = firstTimers.filter(ft => ft.visit_type?.includes('VISITING')).length;

        // Calculate top cells
        const cellStats = new Map<string, number>();
        firstTimers.forEach(ft => {
          if (ft.cell_name) {
            cellStats.set(ft.cell_name, (cellStats.get(ft.cell_name) || 0) + 1);
          }
        });

        reportData.topCells = Array.from(cellStats.entries())
          .map(([cell, count]) => ({
            cell,
            count,
            total: firstTimers.length
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Calculate top inviters
        const inviterStats = new Map<string, { invited: number; joined: number; deciding: number; notContinuing: number }>();
        firstTimers.forEach(ft => {
          if (ft.invited_by) {
            const current = inviterStats.get(ft.invited_by) || { invited: 0, joined: 0, deciding: 0, notContinuing: 0 };
            current.invited++;
            
            if (ft.followup_outcome_status === 'fully_joined') current.joined++;
            else if (ft.followup_outcome_status === 'still_deciding') current.deciding++;
            else if (ft.followup_outcome_status === 'not_continuing') current.notContinuing++;
            
            inviterStats.set(ft.invited_by, current);
          }
        });

        reportData.topInviters = Array.from(inviterStats.entries())
          .map(([inviter, stats]) => ({
            inviter,
            invitedCount: stats.invited,
            fullyJoinedCount: stats.joined,
            stillDecidingCount: stats.deciding,
            notContinuingCount: stats.notContinuing,
            pendingCount: 0, // Would need additional logic
            conversionRate: stats.invited > 0 ? Math.round((stats.joined / stats.invited) * 100) : 0
          }))
          .sort((a, b) => b.invitedCount - a.invitedCount)
          .slice(0, 10);
      }
    }

    // Fetch follow-ups data for the period
    if (validatedData.includeFollowups) {
      let followupsQuery = supabase
        .from('followups')
        .select('*')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('created_at', { ascending: false });
      
      if (validatedData.branchId) {
        followupsQuery = followupsQuery.eq('branch_id', validatedData.branchId);
      }

      const { data: followups, error: followupsError } = await followupsQuery;

      if (followupsError) {
        console.error('Error fetching followups:', followupsError);
        return NextResponse.json(
          { error: 'Failed to fetch followups data' },
          { status: 500 }
        );
      }

      if (followups) {
        reportData.followups = followups;
        reportData.stats.totalFollowups = followups.length;
        reportData.stats.followupsContacted = followups.filter(f => f.status === 'Contacted').length;
        
        // Calculate completion rate for the period
        const uniqueFirstTimersInPeriod = new Set(followups.map(f => f.first_timer_id)).size;
        const totalAssignedFirstTimers = reportData.stats.assignedFirstTimers;
        
        reportData.stats.followedUpThisWeekCount = uniqueFirstTimersInPeriod;
        reportData.stats.pendingFollowupThisWeekCount = Math.max(totalAssignedFirstTimers - uniqueFirstTimersInPeriod, 0);
        reportData.stats.completionRate = totalAssignedFirstTimers > 0 
          ? Math.round((uniqueFirstTimersInPeriod / totalAssignedFirstTimers) * 100) 
          : 0;
      }
    }

    // Fetch caller performance data for the period
    let callersQuery = supabase
      .from('callers')
      .select('*')
      .eq('role', 'caller');

    if (validatedData.branchId) {
      callersQuery = callersQuery.eq('branch_id', validatedData.branchId);
    }

    const { data: callers, error: callersError } = await callersQuery;

    if (callersError) {
      console.error('Error fetching callers:', callersError);
      return NextResponse.json(
        { error: 'Failed to fetch callers data' },
        { status: 500 }
      );
    }

    if (callers) {
      reportData.callerPerformance = callers.map(caller => {
        // Get first timers assigned to this caller in the period
        const callerFirstTimers = reportData.firstTimers.filter(ft => ft.assigned_caller_id === caller.id);
        
        // Get follow-ups by this caller in the period
        const callerFollowups = reportData.followups.filter(f => f.caller_id === caller.id);
        
        // Calculate unique first timers followed up by this caller in the period
        const uniqueFirstTimersFollowedUp = new Set(callerFollowups.map(f => f.first_timer_id)).size;
        
        return {
          name: caller.name,
          assigned: callerFirstTimers.length,
          followedUpThisWeek: uniqueFirstTimersFollowedUp,
          pendingThisWeek: Math.max(callerFirstTimers.length - uniqueFirstTimersFollowedUp, 0),
          fullyJoined: callerFirstTimers.filter(ft => ft.followup_outcome_status === 'fully_joined').length,
        };
      }).filter(cp => cp.assigned > 0); // Only include callers with assignments
    }

    // Generate the report
    if (validatedData.format === 'pdf') {
      const pdfBlob = generateReportBlob(reportData);
      
      return new NextResponse(pdfBlob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="telepastoring-report-${validatedData.period.replace(/\s+/g, '-').toLowerCase()}.pdf"`,
        },
      });
    } else {
      // CSV format
      const csvData = generateCSVReport(reportData);
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="telepastoring-report-${validatedData.period.replace(/\s+/g, '-').toLowerCase()}.csv"`,
        },
      });
    }

  } catch (error) {
    console.error('Report generation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateCSVReport(reportData: ReportData): string {
  const headers = [
    'Report Period',
    'Branch',
    'Generated At',
    'Total First Timers',
    'Assigned',
    'Unassigned',
    'Fully Joined',
    'Joining',
    'Visiting',
    'Followed Up This Week',
    'Pending Follow-up',
    'Total Follow-ups',
    'Contacted',
    'Completion Rate (%)',
  ];

  const rows = [
    headers.join(','),
    [
      reportData.period,
      reportData.branchName,
      reportData.generatedAt.toISOString(),
      reportData.stats.totalFirstTimers,
      reportData.stats.assignedFirstTimers,
      reportData.stats.unassignedFirstTimers,
      reportData.stats.fullyJoinedCount,
      reportData.stats.joiningCount,
      reportData.stats.visitingCount,
      reportData.stats.followedUpThisWeekCount,
      reportData.stats.pendingFollowupThisWeekCount,
      reportData.stats.totalFollowups,
      reportData.stats.followupsContacted,
      reportData.stats.completionRate,
    ].join(','),
    '',
    'Top Cells',
    'Cell,Count,Share (%)',
    ...reportData.topCells.map(cell => 
      `"${cell.cell}",${cell.count},${Math.round((cell.count / cell.total) * 100)}`
    ),
    '',
    'Top Inviters',
    'Inviter,Total Invited,Fully Joined,Still Deciding,Conversion Rate (%)',
    ...reportData.topInviters.map(inviter => 
      `"${inviter.inviter}",${inviter.invitedCount},${inviter.fullyJoinedCount},${inviter.stillDecidingCount},${inviter.conversionRate}`
    ),
    '',
    'Caller Performance',
    'Caller,Assigned,Followed Up This Week,Pending This Week,Fully Joined',
    ...reportData.callerPerformance.map(caller => 
      `"${caller.name}",${caller.assigned},${caller.followedUpThisWeek},${caller.pendingThisWeek},${caller.fullyJoined}`
    ),
  ];

  return rows.join('\n');
}
