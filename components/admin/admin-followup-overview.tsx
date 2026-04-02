"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Phone, CheckCircle, Clock, AlertCircle, TrendingUp, Users } from "lucide-react";

interface FollowupStats {
  totalFirstTimers: number;
  followedUpThisWeek: number;
  pendingThisWeek: number;
  completionRate: number;
  statusBreakdown: {
    contacted: number;
    pending: number;
    notReachable: number;
  };
  weeklyTrend: Array<{
    day: string;
    followedUp: number;
    pending: number;
  }>;
}

interface AdminFollowupOverviewProps {
  stats: FollowupStats;
  isLoading?: boolean;
  /** When true, only the chart panel is shown (use when KPIs are rendered on the parent screen). */
  embedChartsOnly?: boolean;
}

const cardClass = "rounded-3xl border-slate-200 shadow-sm";

export function AdminFollowupOverview({
  stats,
  isLoading,
  embedChartsOnly = false,
}: AdminFollowupOverviewProps) {
  if (isLoading) {
    if (embedChartsOnly) {
      return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className={cardClass}>
              <CardContent className="pt-6">
                <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    return (
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Phone className="h-5 w-5" />
            Follow-up Overview
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

  const statusData = [
    { name: 'Contacted', value: stats.statusBreakdown.contacted, color: '#10b981' },
    { name: 'Pending', value: stats.statusBreakdown.pending, color: '#f59e0b' },
    { name: 'Not Reachable', value: stats.statusBreakdown.notReachable, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const chartsSection = (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-slate-900">Status distribution</CardTitle>
          <p className="text-sm font-normal text-slate-500">
            Outcomes for follow-up records this period
          </p>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              <p>No follow-up data for charts yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-slate-900">Activity by day</CardTitle>
          <p className="text-sm font-normal text-slate-500">
            Follow-up entries logged each day this week
          </p>
        </CardHeader>
        <CardContent>
          {stats.weeklyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="followedUp" fill="#0f172a" name="Logged" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#94a3b8" name="Pending" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              <p>No day-by-day data for this week yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (embedChartsOnly) {
    return chartsSection;
  }

  return (
    <div className="space-y-6">
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <TrendingUp className="h-5 w-5" />
            Weekly follow-up summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{stats.totalFirstTimers}</p>
              <p className="text-xs text-slate-500">Assigned first timers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{stats.followedUpThisWeek}</p>
              <p className="text-xs text-slate-500">Followed up</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{stats.pendingThisWeek}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${getCompletionColor(stats.completionRate)}`}>
                {stats.completionRate}%
              </p>
              <p className="text-xs text-slate-500">Completion rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-slate-900">Overall progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm text-slate-600">
                <span>Weekly follow-up progress</span>
                <span className="font-medium text-slate-900">
                  {stats.followedUpThisWeek} / {stats.totalFirstTimers}
                </span>
              </div>
              <Progress value={stats.completionRate} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <CheckCircle className="mx-auto mb-1 h-6 w-6 text-green-600" />
                <p className="font-semibold text-slate-900">{stats.statusBreakdown.contacted}</p>
                <p className="text-xs text-slate-500">Contacted</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <Clock className="mx-auto mb-1 h-6 w-6 text-amber-600" />
                <p className="font-semibold text-slate-900">{stats.statusBreakdown.pending}</p>
                <p className="text-xs text-slate-500">Pending</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <AlertCircle className="mx-auto mb-1 h-6 w-6 text-red-600" />
                <p className="font-semibold text-slate-900">{stats.statusBreakdown.notReachable}</p>
                <p className="text-xs text-slate-500">Not reachable</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {chartsSection}
    </div>
  );
}
