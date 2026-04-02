// Official cell list
export const OFFICIAL_CELL_LIST = [
  "Agathos", "Dunamis", "Proton", "Oasis", "River Central", "Agape",
  "Doxaxo", "Havillah", "Phronesis", "Lambano", "Chara", "River"
];

export function normalizeCellName(name: string): string {
  if (!name) return name;
  const trimmed = name.trim();
  // Find case-insensitive match in official list
  const match = OFFICIAL_CELL_LIST.find(
    (cell) => cell.toLowerCase() === trimmed.toLowerCase()
  );
  return match || trimmed;
}
