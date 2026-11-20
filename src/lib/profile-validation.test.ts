import { describe, expect, it } from "vitest";
import { formatMonth } from "./format";
import {
  experienceSchema,
  parseHighlights,
  profileSchema,
} from "./profile-validation";

describe("parseHighlights", () => {
  it("splits lines and strips bullet characters", () => {
    expect(
      parseHighlights("- Built an API\n• Cut load time\n\n  Led a team  ")
    ).toEqual(["Built an API", "Cut load time", "Led a team"]);
  });
});

describe("experienceSchema", () => {
  const base = {
    company: "Acme",
    title: "Engineer",
    location: "",
    startDate: "2022-03",
    endDate: "",
    highlights: "Shipped a thing",
  };

  it("treats an empty end date as a current role", () => {
    const result = experienceSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.endDate).toBeNull();
      expect(result.data.location).toBeNull();
    }
  });

  it("rejects an end date before the start date", () => {
    const result = experienceSchema.safeParse({ ...base, endDate: "2021-12" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid month", () => {
    expect(
      experienceSchema.safeParse({ ...base, startDate: "2022-13" }).success
    ).toBe(false);
  });
});

describe("profileSchema", () => {
  const base = {
    fullName: "Ada Lovelace",
    headline: "",
    contactEmail: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
    summary: "",
  };

  it("accepts a minimal profile and turns empty fields into null", () => {
    const result = profileSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.headline).toBeNull();
  });

  it("accepts https links", () => {
    const result = profileSchema.safeParse({
      ...base,
      github: "https://github.com/ada",
    });
    expect(result.success).toBe(true);
  });

  it("rejects links that are not http or https", () => {
    const result = profileSchema.safeParse({
      ...base,
      website: "javascript:alert(1)",
    });
    expect(result.success).toBe(false);
  });
});

describe("formatMonth", () => {
  it("formats a month for display", () => {
    expect(formatMonth("2022-03")).toBe("Mar 2022");
  });
});