import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  Legend,
} from "recharts";

// Match the colors from ReportCharts for consistency
const MC_COLORS = [
  "#8B5CF6", // purple
  "#10B981", // green
  "#F59E0B", // amber
  "#3B82F6", // blue
  "#EC4899", // pink
  "#6366F1", // indigo
];

const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const mcName = data.payload.mc || data.name || "Unknown";
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

type Breakpoint = "mobile" | "tablet" | "desktop";

function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setBp(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return bp;
}

const CHART_CONFIG: Record<
  Breakpoint,
  { innerRadius: number; outerRadius: number; cx: string }
> = {
  mobile: { innerRadius: 35, outerRadius: 65, cx: "50%" },
  tablet: { innerRadius: 50, outerRadius: 85, cx: "50%" },
  desktop: { innerRadius: 60, outerRadius: 100, cx: "50%" },
};

interface MCStatsChartProps {
  chartData: { name: string; value: number }[];
  hoveredIndex: number | null;
}

export function MCStatsChart({ chartData, hoveredIndex }: MCStatsChartProps) {
  const bp = useBreakpoint();
  const { innerRadius, outerRadius, cx } = CHART_CONFIG[bp];
  const isMobile = bp === "mobile";

  return (
    <div className="w-full h-56 sm:h-72 lg:h-96 mx-auto flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx={cx}
            cy="50%"
            labelLine={false}
            label={false}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={isMobile ? 3 : 5}
            fill="#8884d8"
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={MC_COLORS[index % MC_COLORS.length]}
                opacity={
                  hoveredIndex === null || hoveredIndex === index ? 1 : 0.3
                }
                style={{
                  transition: "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            }}
            content={<CustomTooltip />}
          />
          <Legend
            layout={isMobile ? "horizontal" : "vertical"}
            align={isMobile ? "center" : "right"}
            verticalAlign={isMobile ? "bottom" : "middle"}
            iconType="circle"
            iconSize={isMobile ? 8 : 10}
            wrapperStyle={{
              fontSize: isMobile ? "10px" : "11px",
              paddingTop: isMobile ? "8px" : "0",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export { MC_COLORS };
