import { describe, expect, it } from "vitest";

import {
  availabilityKey,
  getTimeBlockLabel,
} from "@/lib/availability-view";

describe("availability-view", () => {
  it("builds a stable availability key", () => {
    expect(availabilityKey(1, "08:00", "12:00")).toBe("1:08:00-12:00");
  });

  it("returns the known block label when times match a configured block", () => {
    expect(getTimeBlockLabel("08:00", "12:00")).toBe("Morning");
  });

  it("falls back to the raw time range for unknown blocks", () => {
    expect(getTimeBlockLabel("09:30", "11:15")).toBe("09:30 - 11:15");
  });
});
