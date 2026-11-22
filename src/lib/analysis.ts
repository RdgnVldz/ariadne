import { z } from "zod";

export const analysisSchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  seniority: z.enum([
    "intern",
    "junior",
    "mid",
    "senior",
    "lead",
    "unspecified",
  ]),
  summary: z.string(),
  requirements: z.array(
    z.object({
      requirement: z.string(),
      importance: z.enum(["required", "preferred"]),
      status: z.enum(["strong", "partial", "missing"]),
      evidence: z.string(),
    })
  ),
  keywords: z.array(z.string()),
});

export type Analysis = z.output<typeof analysisSchema>;
export type Requirement = Analysis["requirements"][number];

const WEIGHT = { required: 3, preferred: 1 } as const;
const CREDIT = { strong: 1, partial: 0.5, missing: 0 } as const;

/** Weighted share of requirements covered, from 0 to 100. */
export function computeFitScore(requirements: Requirement[]): number | null {
  let total = 0;
  let earned = 0;
  for (const r of requirements) {
    const weight = WEIGHT[r.importance];
    total += weight;
    earned += weight * CREDIT[r.status];
  }
  return total === 0 ? null : Math.round((earned / total) * 100);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Keywords from the posting that don't appear in the profile text. */
export function findMissingKeywords(
  keywords: string[],
  profileText: string
): string[] {
  const seen = new Set<string>();
  return keywords.filter((keyword) => {
    const term = keyword.trim();
    const key = term.toLowerCase();
    if (!term || term.length > 60 || seen.has(key)) return false;
    seen.add(key);
    // Match whole terms only, so "Java" doesn't match "JavaScript".
    const pattern = new RegExp(
      `(?<![A-Za-z0-9])${escapeRegExp(term)}(?![A-Za-z0-9])`,
      "i"
    );
    return !pattern.test(profileText);
  });
}

export type ProfileSnapshot = {
  profile: {
    headline: string | null;
    summary: string | null;
  } | null;
  experiences: {
    company: string;
    title: string;
    startDate: string;
    endDate: string | null;
    highlights: string[];
  }[];
  projects: {
    name: string;
    description: string | null;
    techStack: string[];
    highlights: string[];
  }[];
  education: { school: string; degree: string; field: string | null }[];
  skills: { category: string; items: string[] }[];
};

/** Turns the master profile into plain text for the model and keyword check. */
export function buildProfileText(s: ProfileSnapshot): string {
  const lines: string[] = [];

  if (s.profile?.headline) lines.push(`Headline: ${s.profile.headline}`);
  if (s.profile?.summary) lines.push(`Summary: ${s.profile.summary}`);

  if (s.skills.length > 0) {
    lines.push("", "Skills:");
    for (const g of s.skills) {
      lines.push(`- Skills: ${g.category}: ${g.items.join(", ")}`);
    }
  }

  if (s.experiences.length > 0) {
    lines.push("", "Work experience:");
    for (const e of s.experiences) {
      lines.push(
        `- Work: ${e.title} at ${e.company} (${e.startDate} to ${e.endDate ?? "present"})`
      );
      for (const h of e.highlights) lines.push(`  * ${h}`);
    }
  }

  if (s.projects.length > 0) {
    lines.push("", "Projects:");
    for (const p of s.projects) {
      lines.push(`- Project: ${p.name}`);
      if (p.description) lines.push(`  ${p.description}`);
      if (p.techStack.length > 0) lines.push(`  Tech: ${p.techStack.join(", ")}`);
      for (const h of p.highlights) lines.push(`  * ${h}`);
    }
  }

  if (s.education.length > 0) {
    lines.push("", "Education:");
    for (const e of s.education) {
      const field = e.field ? `, ${e.field}` : "";
      lines.push(`- Education: ${e.degree}${field} at ${e.school}`);
    }
  }

  return lines.join("\n");
}