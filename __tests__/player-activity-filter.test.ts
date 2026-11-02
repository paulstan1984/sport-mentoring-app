import { describe, expect, it } from "vitest";
import { getPlayerActivityFilter } from "@/lib/playerActivityFilter";

describe("getPlayerActivityFilter", () => {
  it("defaults to active players", () => {
    expect(getPlayerActivityFilter()).toBe("active");
    expect(getPlayerActivityFilter("invalid")).toBe("active");
  });

  it("accepts inactive and all filters", () => {
    expect(getPlayerActivityFilter("inactive")).toBe("inactive");
    expect(getPlayerActivityFilter("all")).toBe("all");
  });
});
