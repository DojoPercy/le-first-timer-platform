import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";

const COLORS = {
  Contacted: "#3b82f6", // blue
  Pending: "#f59e0b", // yellow/amber
  "Not Reachable": "#ef4444", // red
};

const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {data.name}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">{data.value}</span> follow-up{data.value !== 1 ? 's' : ''}
        </p>
        {data.payload?.percent !== undefined && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
            {((data.payload.percent as number) * 100).toFixed(1)}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

interface FollowupStatusChartProps {
  chartData: { name: string; value: number }[];
  statusCounts: Record<string, number>;
  totalFollowups: number;
}

export function FollowupStatusChart({ chartData, statusCounts, totalFollowups }: FollowupStatusChartProps) {
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] text-muted-foreground border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-900/30">
        <p className="text-sm">No follow-ups recorded this week</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/30 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-800">
      <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">Follow-up Status This Week</h4>
      <div className="space-y-4 sm:space-y-5">
        <div className="w-full h-[200px] sm:h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={90}
                innerRadius={30}
                fill="#8884d8"
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name as keyof typeof COLORS] || "#8884d8"}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2.5 pt-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div
                  className="h-3.5 w-3.5 rounded-full shadow-sm"
                  style={{
                    backgroundColor:
                      COLORS[status as keyof typeof COLORS] || "#8884d8",
                  }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{status}</span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-gray-900 dark:text-gray-100">{count}</span>
                {totalFollowups > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {Math.round((count / totalFollowups) * 100)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
