/** Solid badge styles for course level labels (homepage & catalog). */
export function levelBadgeClass(level: string): string {
  switch (level.toLowerCase()) {
    case "beginner":
      return "bg-emerald-500 text-white";
    case "intermediate":
      return "bg-amber-400 text-slate-900";
    case "advanced":
      return "bg-orange-500 text-white";
    default:
      return "bg-slate-500 text-white";
  }
}

export function formatLevelLabel(level: string): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}
