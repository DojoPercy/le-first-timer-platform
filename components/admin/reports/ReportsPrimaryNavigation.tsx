"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ActiveTab } from "@/app/admin/reports/reports-page-constants";

interface ReportsPrimaryNavigationProps {
  activeTab: ActiveTab;
  onActiveTabChange: (value: ActiveTab) => void;
}

const tabs: Array<{ value: ActiveTab; label: string; mobileLabel?: string }> = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "soul-wins", label: "Soul Wins", mobileLabel: "Wins" },
];

export function ReportsPrimaryNavigation({
  activeTab,
  onActiveTabChange,
}: ReportsPrimaryNavigationProps) {
  return (
    <div className="flex min-w-max items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-900/50">
      <Tabs
        value={activeTab}
        onValueChange={(value) => onActiveTabChange(value as ActiveTab)}
        className="w-auto flex-none"
      >
        <TabsList className="flex flex-nowrap gap-0.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={`flex-none rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200 sm:px-4 sm:text-xs ${
                activeTab === tab.value
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                  : "border-transparent bg-transparent text-slate-900 hover:bg-indigo-100 dark:text-slate-100 dark:hover:bg-indigo-900/30"
              }`}
            >
              <span className={tab.mobileLabel ? "hidden sm:inline" : ""}>{tab.label}</span>
              {tab.mobileLabel ? <span className="sm:hidden">{tab.mobileLabel}</span> : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
