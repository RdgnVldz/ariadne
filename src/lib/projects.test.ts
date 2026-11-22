import { describe, expect, it } from "vitest";
import { projectSchema, splitList } from "./profile-validation";

describe("splitList", () => {
  it("trims, drops empties, and removes duplicates ignoring case", () => {
    expect(splitList(" Next.js, react,React ,, Tailwind ")).toEqual([
      "Next.js",
      "react",
      "Tailwind",
    ]);
  });
});

describe("projectSchema", () => {
  const base = {
    name: "Atlas",
    link: "",
    repoUrl: "",
    description: "",
    techStack: "",
    highlights: "",
  };

  it("accepts a minimal project and turns empty fields into null", () => {
    const result = projectSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.link).toBeNull();
      expect(result.data.description).toBeNull();
      expect(result.data.techStack).toEqual([]);
    }
  });

  it("parses technologies and bullets", () => {
    const result = projectSchema.safeParse({
      ...base,
      techStack: "Next.js, react, React",
      highlights: "- Built the API\n- Deployed to Vercel",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.techStack).toEqual(["Next.js", "react"]);
      expect(result.data.highlights).toEqual([
        "Built the API",
        "Deployed to Vercel",
      ]);
    }
  });

  it("requires a name", () => {
    expect(projectSchema.safeParse({ ...base, name: "  " }).success).toBe(false);
  });

  it("rejects links that are not http or https", () => {
    expect(
      projectSchema.safeParse({ ...base, link: "javascript:alert(1)" }).success
    ).toBe(false);
    expect(
      projectSchema.safeParse({ ...base, repoUrl: "ftp://example.com/repo" })
        .success
    ).toBe(false);
  });

  it("accepts https links", () => {
    expect(
      projectSchema.safeParse({
        ...base,
        link: "https://example.com",
        repoUrl: "https://github.com/ada/atlas",
      }).success
    ).toBe(true);
  });

  it("enforces the length limits", () => {
    expect(
      projectSchema.safeParse({ ...base, name: "x".repeat(101) }).success
    ).toBe(false);
    expect(
      projectSchema.safeParse({ ...base, description: "x".repeat(301) }).success
    ).toBe(false);
    const manyTech = Array.from({ length: 21 }, (_, i) => `Tech${i}`).join(", ");
    expect(
      projectSchema.safeParse({ ...base, techStack: manyTech }).success
    ).toBe(false);
    const manyBullets = Array.from({ length: 7 }, (_, i) => `Bullet ${i}`).join("\n");
    expect(
      projectSchema.safeParse({ ...base, highlights: manyBullets }).success
    ).toBe(false);
  });
});