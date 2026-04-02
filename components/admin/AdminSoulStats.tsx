"use client";

interface AdminSoulStatsProps {
  totalSouls: number;
  assignedSouls: number;
  unassignedSouls: number;
  altarCallSouls: number;
}

const cards = [
  { key: "totalSouls", label: "Total Souls", accent: "bg-blue-500", valueClass: "text-primary" },
  { key: "assignedSouls", label: "Assigned Souls", accent: "bg-green-500", valueClass: "text-green-600 dark:text-green-400" },
  { key: "unassignedSouls", label: "Unassigned Souls", accent: "bg-red-500", valueClass: "text-red-600 dark:text-red-400" },
  { key: "altarCallSouls", label: "Altar Call Souls", accent: "bg-orange-500", valueClass: "text-orange-600 dark:text-orange-400" },
] as const;

export function AdminSoulStats({
  totalSouls,
  assignedSouls,
  unassignedSouls,
  altarCallSouls,
}: AdminSoulStatsProps) {
  const values = { totalSouls, assignedSouls, unassignedSouls, altarCallSouls };

  return (
    <div className="mb-4 grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-border/60 bg-card px-3 py-3 shadow-sm sm:px-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
              {card.label}
            </p>
            <span className={`${card.accent} h-2.5 w-2.5 rounded-full`} />
          </div>
          <p className={`mt-2 text-lg font-semibold sm:text-xl ${card.valueClass}`}>
            {values[card.key].toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
