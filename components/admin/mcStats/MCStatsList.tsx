import { MC_COLORS } from "./MCStatsChart";
import type { MCStat } from "@/lib/types";

interface MCStatsListProps {
  mcStats: MCStat[];
  totalSouls: number;
  hoveredIndex: number | null;
  onMouseEnter: (index: number) => void;
  onMouseLeave: () => void;
}

export function MCStatsList({
  mcStats,
  totalSouls,
  hoveredIndex,
  onMouseEnter,
  onMouseLeave,
}: MCStatsListProps) {
  return (
    <div className="space-y-2 pt-4 max-h-100 lg:max-h-112.5 overflow-y-auto">
      {mcStats.map((stat, index) => (
        <div
          key={stat.mc}
          className="flex items-center justify-between cursor-pointer px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300 ease-in-out"
          onMouseEnter={() => onMouseEnter(index)}
          onMouseLeave={onMouseLeave}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              className="h-3.5 w-3.5 rounded-full shadow-sm shrink-0"
              style={{
                backgroundColor: MC_COLORS[index % MC_COLORS.length],
              }}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {stat.mc}
            </span>
          </div>
          <div className="text-right shrink-0 ml-2">
            <span className="text-base font-bold text-gray-900 dark:text-gray-100">
              {stat.count}
            </span>
            {totalSouls > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {Math.round((stat.count / totalSouls) * 100)}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
