import { Breakpoint } from "./useBreakpoint";

export const MC_CHART_CONFIG: Record<
  Breakpoint,
  { innerRadius: number; outerRadius: number; cx: string }
> = {
  mobile: { innerRadius: 35, outerRadius: 65, cx: "50%" },
  tablet: { innerRadius: 50, outerRadius: 85, cx: "50%" },
  desktop: { innerRadius: 60, outerRadius: 100, cx: "50%" },
};

// Helper function to abbreviate names (e.g., "John Doe" -> "JD")
export const abbreviateName = (fullName: string): string => {
  if (!fullName) return "??";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    // Single name, take first 2 letters
    return parts[0].substring(0, 2).toUpperCase();
  }
  // Take first letter of each part
  return parts
    .map(part => part.charAt(0).toUpperCase())
    .join("");
};
