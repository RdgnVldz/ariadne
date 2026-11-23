import { describe, expect, it } from "vitest";
import { formatIsoDate, todayInZone } from "./format";
import { statusSchema, trackerDetailsSchema } from "./tracker";

describe("statusSchema", () => {
  it("accepts the known stages", () => {
    for (const s of ["saved", "applied", "interviewing", "offer", "rejected"]) {
      expect(statusSchema.safeParse(s).success).toBe(true);
    }
  });

  it("rejects anything else", () => {
    expect(statusSchema.safeParse("hired").success).toBe(false);
    expect(statusSchema.safeParse("").success).toBe(false);
  });
});

describe("trackerDetailsSchema", () => {
  const base = { jobUrl: "", notes: "", appliedOn: "", followUpOn: "" };

  it("turns empty fields into null", () => {
    const result = trackerDetailsSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        jobUrl: null,
        notes: null,
        appliedOn: null,
        followUpOn: null,
      });
    }
  });

  it("accepts https links and real dates", () => {
    const result = trackerDetailsSchema.safeParse({
      ...base,
      jobUrl: "https://example.com/jobs/1",
      appliedOn: "2026-11-23",
      followUpOn: "2026-12-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects links that are not http or https", () => {
    expect(
      trackerDetailsSchema.safeParse({ ...base, jobUrl: "javascript:alert(1)" })
        .success
    ).toBe(false);
  });

  it("rejects invalid dates", () => {
    expect(
      trackerDetailsSchema.safeParse({ ...base, appliedOn: "not-a-date" }).success
    ).toBe(false);
    expect(
      trackerDetailsSchema.safeParse({ ...base, followUpOn: "2026-13-01" }).success
    ).toBe(false);
  });

  it("limits the length of notes", () => {
    expect(
      trackerDetailsSchema.safeParse({ ...base, notes: "x".repeat(2001) }).success
    ).toBe(false);
  });
});

describe("dates", () => {
  it("uses the display time zone for today", () => {
    // 20:00 UTC is already the next morning in Manila (UTC+8).
    expect(todayInZone(new Date("2026-11-23T20:00:00Z"))).toBe("2026-11-24");
    expect(todayInZone(new Date("2026-11-23T10:00:00Z"))).toBe("2026-11-23");
  });

  it("formats a date-only value without shifting the day", () => {
    expect(formatIsoDate("2026-11-23")).toBe("Nov 23, 2026");
  });
});