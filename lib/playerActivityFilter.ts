export type PlayerActivityFilter = "active" | "inactive" | "all";

export function getPlayerActivityFilter(value?: string): PlayerActivityFilter {
  if (value === "inactive" || value === "all") return value;
  return "active";
}
