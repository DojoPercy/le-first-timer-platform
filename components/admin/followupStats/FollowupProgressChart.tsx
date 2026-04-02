import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";

const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {data.name}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">{data.value}</span> soul{data.value !== 1 ? 's' : ''}
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

interface FollowupProgressChartProps {
  followedUpCount: number;
  notFollowedUpCount: number;
  totalSouls: number;
}

export function FollowupProgressChart({ followedUpCount, notFollowedUpCount, totalSouls }: FollowupProgressChartProps) {
  const followupOverviewData = [
    { name: "Followed Up", value: followedUpCount, color: "#3b82f6" },
    { name: "Not Followed Up", value: notFollowedUpCount, color: "#e5e7eb" },
  ];

  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/30 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-800">
      <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">Weekly Follow-up Progress</h4>
      <div className="space-y-4 sm:space-y-5">
        <div className="w-full h-[200px] sm:h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={followupOverviewData}
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
                {followupOverviewData.map((entry, index) => (
                  <Cell key={`cell-overview-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="h-3.5 w-3.5 rounded-full bg-blue-500 shadow-sm" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Followed Up</span>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-gray-900 dark:text-gray-100">{followedUpCount}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {totalSouls > 0 ? Math.round((followedUpCount / totalSouls) * 100) : 0}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="h-3.5 w-3.5 rounded-full bg-gray-300 dark:bg-gray-600 shadow-sm" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Not Followed Up</span>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-gray-900 dark:text-gray-100">{notFollowedUpCount}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {totalSouls > 0 ? Math.round((notFollowedUpCount / totalSouls) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
