import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
            <span
              className="inline-block w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.value}</span> soul{entry.value !== 1 ? "s" : ""} won
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface SoulsWonLineChartProps {
  trendData: { period: string; count: number }[];
  viewMode: "monthly" | "yearly";
}

export function SoulsWonLineChart({ trendData, viewMode }: SoulsWonLineChartProps) {
  return (
    <div className="w-full h-56 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={trendData.map(d => ({ period: d.period, count: d.count }))}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            className="dark:stroke-gray-700"
            opacity={0.3}
          />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            className="dark:fill-gray-400"
            angle={viewMode === "monthly" ? -45 : 0}
            textAnchor={viewMode === "monthly" ? "end" : "middle"}
            height={viewMode === "monthly" ? 80 : 30}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            className="dark:fill-gray-400"
            domain={[0, 1000]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {value}
              </span>
            )}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
            name="Souls Won"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
