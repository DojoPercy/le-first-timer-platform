import { NextRequest, NextResponse } from 'next/server';
import { generateReportBlob, type ReportData } from '@/lib/utils/pdf-generator';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const generateReportSchema = z.object({
  period: z.string(),
  branchId: z.string().optional(),
  includeFirstTimers: z.boolean().default(true),
  includeFollowups: z.boolean().default(true),
  format: z.enum(['pdf', 'csv']).default('pdf'),
});

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

    // Fetch report data
    const reportData: ReportData = {
      period: validatedData.period,
      branchName,
      generatedAt: new Date(),
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

    // Fetch first timers data
    if (validatedData.includeFirstTimers) {
      const { data: firstTimers, error: firstTimersError } = await supabase
        .from('first_timers')
        .select('*')
        .eq('branch_id', validatedData.branchId || null)
        .order('created_at', { ascending: false });

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

    // Fetch follow-ups data
    if (validatedData.includeFollowups) {
      const { data: followups, error: followupsError } = await supabase
        .from('followups')
        .select('*')
        .eq('branch_id', validatedData.branchId || null)
        .order('created_at', { ascending: false });

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
        
        // Calculate weekly completion rate
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const weeklyFollowups = followups.filter(f => new Date(f.date) >= oneWeekAgo);
        const uniqueFirstTimersThisWeek = new Set(weeklyFollowups.map(f => f.first_timer_id)).size;
        const totalAssignedFirstTimers = reportData.stats.assignedFirstTimers;
        
        reportData.stats.followedUpThisWeekCount = uniqueFirstTimersThisWeek;
        reportData.stats.pendingFollowupThisWeekCount = Math.max(totalAssignedFirstTimers - uniqueFirstTimersThisWeek, 0);
        reportData.stats.completionRate = totalAssignedFirstTimers > 0 
          ? Math.round((uniqueFirstTimersThisWeek / totalAssignedFirstTimers) * 100) 
          : 0;
      }
    }

    // Fetch caller performance data
    const { data: callers, error: callersError } = await supabase
      .from('callers')
      .select('*')
      .eq('role', 'caller')
      .eq('branch_id', validatedData.branchId || null);

    if (callersError) {
      console.error('Error fetching callers:', callersError);
      return NextResponse.json(
        { error: 'Failed to fetch callers data' },
        { status: 500 }
      );
    }

    if (callers) {
      reportData.callerPerformance = callers.map(caller => {
        const callerFirstTimers = reportData.firstTimers.filter(ft => ft.assigned_caller_id === caller.id);
        const callerFollowups = reportData.followups.filter(f => f.caller_id === caller.id);
        
        // Calculate weekly follow-ups for this caller
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyFollowups = callerFollowups.filter(f => new Date(f.date) >= oneWeekAgo);
        const uniqueFirstTimersThisWeek = new Set(weeklyFollowups.map(f => f.first_timer_id)).size;
        
        return {
          name: caller.name,
          assigned: callerFirstTimers.length,
          followedUpThisWeek: uniqueFirstTimersThisWeek,
          pendingThisWeek: Math.max(callerFirstTimers.length - uniqueFirstTimersThisWeek, 0),
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
          'Content-Disposition': `attachment; filename="teleporting-report-${validatedData.period.replace(/\s+/g, '-').toLowerCase()}.csv"`,
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
