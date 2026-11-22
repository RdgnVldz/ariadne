import { describe, expect, it } from "vitest";
import {
  buildProfileText,
  computeFitScore,
  findMissingKeywords,
  type Requirement,
} from "./analysis";

function req(
  importance: Requirement["importance"],
  status: Requirement["status"]
): Requirement {
  return { requirement: "x", importance, status, evidence: "" };
}

describe("computeFitScore", () => {
  it("is 100 when everything is a strong match", () => {
    expect(computeFitScore([req("required", "strong"), req("preferred", "strong")])).toBe(100);
  });

  it("is 0 when everything is missing", () => {
    expect(computeFitScore([req("required", "missing")])).toBe(0);
  });

  it("weights required items three times as much as preferred", () => {
    // earned 3 of 4
    expect(computeFitScore([req("required", "strong"), req("preferred", "missing")])).toBe(75);
    // earned 1 of 4
    expect(computeFitScore([req("required", "missing"), req("preferred", "strong")])).toBe(25);
  });

  it("counts a partial match as half", () => {
    expect(computeFitScore([req("required", "partial")])).toBe(50);
  });

  it("returns null when there are no requirements", () => {
    expect(computeFitScore([])).toBeNull();
  });
});

describe("findMissingKeywords", () => {
  const profile = "Skills: React, Node.js, C++, TypeScript\nWork: JavaScript developer";

  it("returns only the keywords that are not in the profile", () => {
    expect(findMissingKeywords(["React", "Kubernetes"], profile)).toEqual(["Kubernetes"]);
  });

  it("ignores case", () => {
    expect(findMissingKeywords(["react", "TYPESCRIPT"], profile)).toEqual([]);
  });

  it("matches whole terms only", () => {
    expect(findMissingKeywords(["Java"], profile)).toEqual(["Java"]);
  });

  it("handles terms with special characters", () => {
    expect(findMissingKeywords(["Node.js", "C++", "C#"], profile)).toEqual(["C#"]);
  });

  it("removes duplicates and blanks", () => {
    expect(findMissingKeywords(["Go", "go", " ", "Go"], profile)).toEqual(["Go"]);
  });
});

describe("buildProfileText", () => {
  it("includes each section and marks a current role as present", () => {
    const text = buildProfileText({
      profile: { headline: "Full-stack engineer", summary: null },
      experiences: [
        { company: "Acme", title: "Developer", startDate: "2022-03", endDate: null, highlights: ["Built an API"] },
      ],
      projects: [
        { name: "Atlas", description: null, techStack: ["Next.js"], highlights: [] },
      ],
      education: [{ school: "State University", degree: "BSc", field: null }],
      skills: [{ category: "Frontend", items: ["React", "Tailwind CSS"] }],
    });

    expect(text).toContain("Headline: Full-stack engineer");
    expect(text).toContain("Work: Developer at Acme (2022-03 to present)");
    expect(text).toContain("Built an API");
    expect(text).toContain("Project: Atlas");
    expect(text).toContain("Tech: Next.js");
    expect(text).toContain("Education: BSc at State University");
    expect(text).toContain("Frontend: React, Tailwind CSS");
  });
});