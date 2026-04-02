import { HiOutlineUserGroup, HiOutlineHeart } from "react-icons/hi";

interface MCSummaryStatsProps {
  totalPeopleReached: number;
  totalSoulsWon: number;
  conversionRate: string;
}

export function MCSummaryStats({
  totalPeopleReached,
  totalSoulsWon,
  conversionRate,
}: MCSummaryStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3">
      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2 sm:p-2.5 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1 sm:p-1.5 bg-blue-500 rounded-lg">
            <HiOutlineUserGroup className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              People Reached Out
            </p>
            <p className="text-base sm:text-lg font-bold text-blue-700 dark:text-blue-300">
              {totalPeopleReached.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-2 sm:p-2.5 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1 sm:p-1.5 bg-green-500 rounded-lg">
            <HiOutlineHeart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[11px] text-green-600 dark:text-green-400 font-medium">
              Souls Won
            </p>
            <p className="text-base sm:text-lg font-bold text-green-700 dark:text-green-300">
              {totalSoulsWon.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-2 sm:p-2.5 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1 sm:p-1.5 bg-purple-500 rounded-lg">
            <span className="text-white text-base sm:text-lg font-bold">%</span>
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[11px] text-purple-600 dark:text-purple-400 font-medium">
              Conversion Rate
            </p>
            <p className="text-base sm:text-lg font-bold text-purple-700 dark:text-purple-300">
              {conversionRate}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
