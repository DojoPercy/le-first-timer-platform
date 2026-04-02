"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { ReportTrendData } from "@/lib/store/reports-store";
import { TrendingUp, Activity, UserPlus } from "lucide-react";

interface ReportTrendChartProps {
  data: ReportTrendData[];
  isLoading?: boolean;
}

export function ReportTrendChart({ data, isLoading }: ReportTrendChartProps) {
  if (isLoading) {
    return (
      <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/20">
        <div className="h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            <p className="text-sm text-muted-foreground">Analyzing trends...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/20">
        <div className="h-[400px] flex items-center justify-center text-muted-foreground text-sm">
          Generate more reports to unlock trend analysis.
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-900 gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
            Performance Growth Trend
          </CardTitle>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Comparing souls won and follow-ups across historical periods.
          </p>
        </div>
        <div className="flex gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Impact
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Activity
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="h-[250px] sm:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFollowups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748B", fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748B" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow:
                    "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                  padding: "12px",
                }}
                itemStyle={{ fontSize: "12px", fontWeight: 600 }}
                labelStyle={{
                  fontSize: "12px",
                  fontWeight: 800,
                  marginBottom: "8px",
                  color: "#1E293B",
                }}
              />
              <Area
                type="monotone"
                dataKey="followups"
                name="Follow-ups"
                stroke="#6366F1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorFollowups)"
              />
              <Area
                type="monotone"
                dataKey="soulsWon"
                name="Souls Won"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Aggregate Insight */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-50 dark:border-slate-900 text-center">
          <div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
              Total Follow-ups
            </p>
            <p className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
              {data.reduce((sum, item) => sum + item.followups, 0)}
            </p>
          </div>
          <div className="border-l border-slate-100 dark:border-slate-800">
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
              Activity
            </p>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
              {data.reduce((sum, item) => sum + item.followups, 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
