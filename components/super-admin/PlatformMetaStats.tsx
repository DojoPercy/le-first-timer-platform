"use client";

interface PlatformMetaStatsProps {
  soulsWon: number;
  branches: number;
  activeBranches: number;
  integrations: number;
}

const statsConfig = [
  { key: "soulsWon", label: "Souls Won", accent: "bg-emerald-500" },
  { key: "branches", label: "Branches", accent: "bg-blue-500" },
  { key: "activeBranches", label: "Active Branches", accent: "bg-green-500" },
  { key: "integrations", label: "Integrations", accent: "bg-indigo-500" },
] as const;

export function PlatformMetaStats({
  soulsWon,
  branches,
  activeBranches,
  integrations,
}: PlatformMetaStatsProps) {
  const values = { soulsWon, branches, activeBranches, integrations };

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
      {statsConfig.map((stat) => (
        <div
          key={stat.key}
          className="rounded-xl border border-border/60 bg-card px-3 py-3 shadow-sm sm:px-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
              {stat.label}
            </p>
            <span className={`${stat.accent} h-2.5 w-2.5 rounded-full`} />
          </div>
          <p className="mt-2 text-lg font-semibold text-foreground sm:text-xl">
            {values[stat.key].toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
