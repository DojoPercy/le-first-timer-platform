import { TooltipProps } from "recharts";

// Custom tooltip to show full names
export const CustomCallerTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="font-semibold text-sm mb-2">{payload[0].payload.fullName}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const CustomMCTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const mcName = data.payload?.name || data.name || "Unknown";
    const displayName =
      mcName.length > 30 ? `${mcName.substring(0, 27)}...` : mcName;

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {displayName}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">{data.value}</span> soul
          {data.value !== 1 ? "s" : ""}
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
