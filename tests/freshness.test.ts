import { describe, expect, it } from "vitest";
import { calculateFreshness, crossedThreshold } from "@/lib/freshness";

describe("deterministic freshness", () => {
  const now = new Date("2026-10-05T12:00:00Z");
  it("maps elapsed time to documented risk bands", () => {
    expect(calculateFreshness("2026-10-05", 10, now)).toMatchObject({ riskScore: 0, status: "Fresh" });
    expect(calculateFreshness("2026-10-01", 10, now)).toMatchObject({ riskScore: 40, status: "Use soon" });
    expect(calculateFreshness("2026-09-28", 10, now)).toMatchObject({ riskScore: 70, status: "High priority" });
    expect(calculateFreshness("2026-09-26", 10, now)).toMatchObject({ riskScore: 90, status: "Check now" });
  });
  it("caps risk and describes an exceeded window without a safety claim", () => {
    expect(calculateFreshness("2026-09-01", 2, now)).toMatchObject({ riskScore: 100, windowExceeded: true, status: "Check now" });
  });
  it("refuses to calculate when guidance is unavailable", () => {
    expect(calculateFreshness("2026-10-01", null, now)).toMatchObject({ riskScore: null, status: "No guidance" });
  });
  it("only emits newly crossed alert thresholds", () => {
    expect(crossedThreshold(null, 72)).toBe(70);
    expect(crossedThreshold(70, 85)).toBeNull();
    expect(crossedThreshold(70, 94)).toBe(90);
    expect(crossedThreshold(90, 100)).toBeNull();
  });
});
