import { describe, expect, it } from "vitest";
import {
  assembleLetter,
  letterBodySchema,
  sanitizeParagraphs,
  wordCount,
} from "./cover-letter";
import type { ResumeSource } from "./resume";

const source: ResumeSource = {
  profile: null,
  experiences: [
    {
      id: "e1",
      company: "Acme",
      title: "Frontend Developer",
      location: null,
      startDate: "2022-03",
      endDate: null,
      highlights: ["Built a dashboard used by 200 customers"],
    },
  ],
  projects: [],
  education: [],
  skills: [{ category: "Frontend", items: ["React"] }],
};

describe("sanitizeParagraphs", () => {
  it("keeps sentences the profile supports", () => {
    const text = "I built a dashboard used by 200 customers. It was rewarding work.";
    const { paragraphs, warnings } = sanitizeParagraphs([text], source);
    expect(paragraphs).toEqual([text]);
    expect(warnings).toEqual([]);
  });

  it("removes only the sentence with an unsupported number", () => {
    const { paragraphs, warnings } = sanitizeParagraphs(
      ["I led a team of 12 engineers. I enjoy working with React."],
      source
    );
    expect(paragraphs).toEqual(["I enjoy working with React."]);
    expect(warnings).toHaveLength(1);
  });

  it("removes sentences with placeholders", () => {
    const { paragraphs, warnings } = sanitizeParagraphs(
      ["I am excited to join [Company Name]."],
      source
    );
    expect(paragraphs).toEqual([]);
    expect(warnings).toHaveLength(1);
  });

  it("drops empty paragraphs and keeps at most four", () => {
    const six = Array.from({ length: 6 }, (_, i) => `Paragraph ${i + 1} about React.`);
    // "Paragraph 1" has a number that isn't in the profile, so use text without digits.
    const clean = ["One about React.", "Two about React.", "", "Three about React.", "Four about React.", "Five about React.", "Six about React."];
    const { paragraphs } = sanitizeParagraphs(clean, source);
    expect(paragraphs).toHaveLength(4);
    expect(paragraphs[0]).toBe("One about React.");
    expect(six).toHaveLength(6);
  });
});

describe("assembleLetter", () => {
  it("adds a greeting and a sign-off with the name", () => {
    const letter = assembleLetter(["First.", "Second."], "Ada Lovelace");
    expect(letter.startsWith("Dear Hiring Manager,\n\nFirst.")).toBe(true);
    expect(letter.endsWith("Sincerely,\nAda Lovelace")).toBe(true);
  });
});

describe("wordCount", () => {
  it("counts words across spaces and newlines", () => {
    expect(wordCount("one two  three\nfour")).toBe(4);
    expect(wordCount("   ")).toBe(0);
  });
});

describe("letterBodySchema", () => {
  it("rejects an empty letter", () => {
    expect(letterBodySchema.safeParse("   ").success).toBe(false);
  });

  it("rejects a letter over the limit", () => {
    expect(letterBodySchema.safeParse("x".repeat(5001)).success).toBe(false);
  });

  it("trims surrounding whitespace", () => {
    const result = letterBodySchema.safeParse("  Hello  ");
    expect(result.success && result.data).toBe("Hello");
  });
});