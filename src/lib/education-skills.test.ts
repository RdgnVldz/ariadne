import { describe, expect, it } from "vitest";
import {
  educationSchema,
  parseSkillGroups,
  skillsSchema,
} from "./profile-validation";

describe("parseSkillGroups", () => {
  it("parses categories and removes duplicates", () => {
    expect(
      parseSkillGroups("Frontend: React, Next.js, react\nTools: Git")
    ).toEqual([
      { category: "Frontend", items: ["React", "Next.js"] },
      { category: "Tools", items: ["Git"] },
    ]);
  });

  it("rejects a line without a category", () => {
    expect(parseSkillGroups("React, Next.js")).toBeNull();
  });

  it("rejects a category with no skills", () => {
    expect(parseSkillGroups("Frontend:")).toBeNull();
  });

  it("returns an empty list for empty input", () => {
    expect(parseSkillGroups("  \n ")).toEqual([]);
  });
});

describe("skillsSchema", () => {
  it("accepts valid input", () => {
    const result = skillsSchema.safeParse({ skills: "Frontend: React" });
    expect(result.success).toBe(true);
  });

  it("rejects more than 12 categories", () => {
    const skills = Array.from({ length: 13 }, (_, i) => `Cat${i}: a`).join("\n");
    expect(skillsSchema.safeParse({ skills }).success).toBe(false);
  });
});

describe("educationSchema", () => {
  const base = {
    school: "State University",
    degree: "Bachelor of Science",
    field: "",
    location: "",
    startDate: "",
    endDate: "",
    highlights: "",
  };

  it("accepts an entry with no dates", () => {
    const result = educationSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.startDate).toBeNull();
  });

  it("rejects an end date before the start date", () => {
    const result = educationSchema.safeParse({
      ...base,
      startDate: "2022-06",
      endDate: "2018-06",
    });
    expect(result.success).toBe(false);
  });
});