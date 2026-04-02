"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getWeekEnd, getWeekStart } from "@/lib/utils/followup-week-check";

interface CallerProgress {
  id: string;
  name: string;
  email: string;
  totalAssigned: number;
  followedUpThisWeek: number;
  pendingThisWeek: number;
  fullyJoined: number;
  stillDeciding: number;
  notContinuing: number;
  completionRate: number;
  lastActivity?: string;
}

interface WeeklyStats {
  totalCallers: number;
  activeCallers: number;
  totalAssigned: number;
  totalFollowedUp: number;
  overallCompletionRate: number;
  weekStart: Date;
  weekEnd: Date;
}

const monitorCardClass = "rounded-3xl border-slate-200 shadow-sm";

interface CallerProgressMonitorProps {
  /** Hide the 5-metric weekly strip when the parent page already shows KPIs */
  hideWeeklyOverview?: boolean;
}

export function CallerProgressMonitor({ hideWeeklyOverview = false }: CallerProgressMonitorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [callerProgress, setCallerProgress] = useState<CallerProgress[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchCallerProgress();
  }, []);

  const fetchCallerProgress = async () => {
    try {
      setIsLoading(true);
      
      const now = new Date();
      const weekStart = getWeekStart(now);
      const weekEnd = getWeekEnd(now);

      // Fetch callers and their assignments
      const { data: callers, error: callersError } = await supabase
        .from('callers')
        .select('*')
        .eq('role', 'caller')
        .order('name');

      if (callersError) throw callersError;

      // Fetch first timers with their follow-up status
      const { data: firstTimers, error: firstTimersError } = await supabase
        .from('first_timers')
        .select('*')
        .order('created_at', { ascending: false });

      if (firstTimersError) throw firstTimersError;

      // Fetch follow-ups for this week
      const { data: weeklyFollowups, error: followupsError } = await supabase
        .from('followups')
        .select('*')
        .gte('date', weekStart.toISOString())
        .lte('date', weekEnd.toISOString());

      if (followupsError) throw followupsError;

      // Process caller progress data
      const progressData: CallerProgress[] = callers.map(caller => {
        const assignedFirstTimers = firstTimers.filter(ft => ft.assigned_caller_id === caller.id);
        const callerFollowups = weeklyFollowups.filter(f => f.caller_id === caller.id);
        
        // Get unique first timers followed up this week
        const uniqueFollowedUpThisWeek = new Set(callerFollowups.map(f => f.first_timer_id)).size;
        
        // Calculate outcomes
        const fullyJoined = assignedFirstTimers.filter(ft => ft.followup_outcome_status === 'fully_joined').length;
        const stillDeciding = assignedFirstTimers.filter(ft => ft.followup_outcome_status === 'still_deciding').length;
        const notContinuing = assignedFirstTimers.filter(ft => ft.followup_outcome_status === 'not_continuing').length;
        
        // Calculate completion rate for this week
        const completionRate = assignedFirstTimers.length > 0 
          ? Math.round((uniqueFollowedUpThisWeek / assignedFirstTimers.length) * 100)
          : 0;

        // Get last activity
        const lastFollowup = callerFollowups
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        return {
          id: caller.id,
          name: caller.name,
          email: caller.email,
          totalAssigned: assignedFirstTimers.length,
          followedUpThisWeek: uniqueFollowedUpThisWeek,
          pendingThisWeek: Math.max(assignedFirstTimers.length - uniqueFollowedUpThisWeek, 0),
          fullyJoined,
          stillDeciding,
          notContinuing,
          completionRate,
          lastActivity: lastFollowup?.date,
        };
      }).filter(cp => cp.totalAssigned > 0); // Only include callers with assignments

      // Calculate weekly stats
      const totalAssigned = progressData.reduce((sum, cp) => sum + cp.totalAssigned, 0);
      const totalFollowedUp = progressData.reduce((sum, cp) => sum + cp.followedUpThisWeek, 0);
      const activeCallers = progressData.filter(cp => cp.followedUpThisWeek > 0).length;
      const overallCompletionRate = totalAssigned > 0 ? Math.round((totalFollowedUp / totalAssigned) * 100) : 0;

      setWeeklyStats({
        totalCallers: callers.length,
        activeCallers,
        totalAssigned,
        totalFollowedUp,
        overallCompletionRate,
        weekStart,
        weekEnd,
      });

      setCallerProgress(progressData.sort((a, b) => b.completionRate - a.completionRate));
    } catch (error) {
      console.error('Failed to fetch caller progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50';
    if (rate >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getActivityStatus = (lastActivity?: string) => {
    if (!lastActivity) return { icon: AlertCircle, color: 'text-gray-400', label: 'No activity' };
    
    const daysSince = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince <= 2) return { icon: CheckCircle, color: 'text-green-500', label: 'Active' };
    if (daysSince <= 5) return { icon: Clock, color: 'text-yellow-500', label: 'Recent' };
    return { icon: AlertCircle, color: 'text-red-500', label: 'Inactive' };
  };

  if (isLoading) {
    return (
      <Card className={monitorCardClass}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Users className="h-5 w-5" />
            Caller progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weeklyStats || callerProgress.length === 0) {
    return (
      <Card className={monitorCardClass}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Users className="h-5 w-5" />
            Caller progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-slate-500">
            <Users className="mx-auto mb-4 h-12 w-12 opacity-40 text-slate-400" />
            <p className="text-sm">No caller assignments found for this week.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!hideWeeklyOverview ? (
        <Card className={monitorCardClass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="h-5 w-5" />
              Weekly overview
            </CardTitle>
            <p className="text-sm text-slate-500">
              {weeklyStats.weekStart.toLocaleDateString()} – {weeklyStats.weekEnd.toLocaleDateString()}{" "}
              (Monday–Sunday)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{weeklyStats.totalCallers}</p>
                <p className="text-xs text-slate-500">Total callers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{weeklyStats.activeCallers}</p>
                <p className="text-xs text-slate-500">Active this week</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{weeklyStats.totalAssigned}</p>
                <p className="text-xs text-slate-500">Assigned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{weeklyStats.totalFollowedUp}</p>
                <p className="text-xs text-slate-500">Followed up</p>
              </div>
              <div className="text-center md:col-span-1 col-span-2">
                <p className="text-2xl font-bold text-slate-900">{weeklyStats.overallCompletionRate}%</p>
                <p className="text-xs text-slate-500">Completion rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className={monitorCardClass}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Users className="h-5 w-5" />
            By caller
          </CardTitle>
          <p className="text-sm text-slate-500">Progress for each caller with assignments this week</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {callerProgress.map((caller) => {
              const activityStatus = getActivityStatus(caller.lastActivity);
              const ActivityIcon = activityStatus.icon;

              return (
                <div
                  key={caller.id}
                  className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{caller.name}</h4>
                        <p className="text-sm text-slate-500">{caller.email}</p>
                      </div>
                      <Badge className={getCompletionColor(caller.completionRate)}>
                        {caller.completionRate}% complete
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <ActivityIcon className={`h-4 w-4 ${activityStatus.color}`} />
                      <span className="text-xs">{activityStatus.label}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Weekly progress</span>
                      <span className="font-medium text-slate-900">
                        {caller.followedUpThisWeek} / {caller.totalAssigned}
                      </span>
                    </div>
                    <Progress value={caller.completionRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <div className="rounded-xl bg-white p-2 text-center ring-1 ring-slate-100">
                      <p className="font-semibold text-slate-900">{caller.totalAssigned}</p>
                      <p className="text-xs text-slate-500">Assigned</p>
                    </div>
                    <div className="rounded-xl bg-white p-2 text-center ring-1 ring-slate-100">
                      <p className="font-semibold text-slate-900">{caller.followedUpThisWeek}</p>
                      <p className="text-xs text-slate-500">This week</p>
                    </div>
                    <div className="rounded-xl bg-white p-2 text-center ring-1 ring-slate-100">
                      <p className="font-semibold text-slate-900">{caller.pendingThisWeek}</p>
                      <p className="text-xs text-slate-500">Pending</p>
                    </div>
                    <div className="rounded-xl bg-white p-2 text-center ring-1 ring-slate-100">
                      <p className="font-semibold text-slate-900">{caller.fullyJoined}</p>
                      <p className="text-xs text-slate-500">Fully joined</p>
                    </div>
                  </div>

                  {(caller.stillDeciding > 0 || caller.notContinuing > 0) ? (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {caller.stillDeciding > 0 ? (
                        <span className="rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-800">
                          {caller.stillDeciding} still deciding
                        </span>
                      ) : null}
                      {caller.notContinuing > 0 ? (
                        <span className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-800">
                          {caller.notContinuing} not continuing
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
