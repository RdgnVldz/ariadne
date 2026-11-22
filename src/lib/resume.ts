import { z } from "zod";
import { findMissingKeywords } from "./analysis";
import { formatMonth } from "./format";

export const HEADINGS = {
  summary: "Summary",
  experience: "Work Experience",
  projects: "Projects",
  education: "Education",
  skills: "Skills",
} as const;

// What the model is allowed to produce. Everything else comes from the database.
export const tailoredSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  experiences: z.array(
    z.object({ id: z.string(), bullets: z.array(z.string()) })
  ),
  projects: z.array(
    z.object({ id: z.string(), bullets: z.array(z.string()) })
  ),
  skills: z.array(
    z.object({ category: z.string(), items: z.array(z.string()) })
  ),
});

export type Tailored = z.output<typeof tailoredSchema>;

export type ResumeSource = {
  profile: {
    fullName: string;
    headline: string | null;
    contactEmail: string | null;
    phone: string | null;
    location: string | null;
    linkedin: string | null;
    github: string | null;
    website: string | null;
    summary: string | null;
  } | null;
  experiences: {
    id: string;
    company: string;
    title: string;
    location: string | null;
    startDate: string;
    endDate: string | null;
    highlights: string[];
  }[];
  projects: {
    id: string;
    name: string;
    link: string | null;
    repoUrl: string | null;
    description: string | null;
    techStack: string[];
    highlights: string[];
  }[];
  education: {
    school: string;
    degree: string;
    field: string | null;
    startDate: string | null;
    endDate: string | null;
    highlights: string[];
  }[];
  skills: { category: string; items: string[] }[];
};

export type ResumeDoc = {
  name: string;
  headline: string | null;
  contact: string[];
  summary: string | null;
  experiences: {
    title: string;
    company: string;
    location: string | null;
    dates: string;
    bullets: string[];
  }[];
  projects: {
    name: string;
    description: string | null;
    tech: string[];
    links: string[];
    bullets: string[];
  }[];
  education: { degree: string; school: string; dates: string | null; bullets: string[] }[];
  skills: { category: string; items: string[] }[];
};

function rangeLabel(start: string | null, end: string | null): string | null {
  if (start && end) return `${formatMonth(start)} to ${formatMonth(end)}`;
  if (end) return formatMonth(end);
  if (start) return `${formatMonth(start)} to Present`;
  return null;
}

/** Plain text of the profile. With ids, it is what the model reads. */
export function buildSourceText(s: ResumeSource, withIds: boolean): string {
  const lines: string[] = [];
  const tag = (id: string) => (withIds ? `[id: ${id}] ` : "");

  if (s.profile?.headline) lines.push(`Headline: ${s.profile.headline}`);
  if (s.profile?.summary) lines.push(`Summary: ${s.profile.summary}`);

  if (s.experiences.length > 0) {
    lines.push("", "Work experience:");
    for (const e of s.experiences) {
      lines.push(
        `- ${tag(e.id)}${e.title} at ${e.company} (${e.startDate} to ${e.endDate ?? "present"})`
      );
      for (const h of e.highlights) lines.push(`  * ${h}`);
    }
  }

  if (s.projects.length > 0) {
    lines.push("", "Projects:");
    for (const p of s.projects) {
      lines.push(`- ${tag(p.id)}${p.name}${p.description ? `: ${p.description}` : ""}`);
      if (p.techStack.length > 0) lines.push(`  Tech: ${p.techStack.join(", ")}`);
      for (const h of p.highlights) lines.push(`  * ${h}`);
    }
  }

  if (s.skills.length > 0) {
    lines.push("", "Skills:");
    for (const g of s.skills) lines.push(`- ${g.category}: ${g.items.join(", ")}`);
  }

  if (s.education.length > 0) {
    lines.push("", "Education:");
    for (const e of s.education) {
      lines.push(`- ${e.degree}${e.field ? `, ${e.field}` : ""} at ${e.school}`);
    }
  }

  return lines.join("\n");
}

export function buildTailoringInput(s: ResumeSource): string {
  return buildSourceText(s, true);
}

function numbersIn(text: string): string[] {
  return text.match(/\d+(?:[.,]\d+)*/g) ?? [];
}

/** True if `text` contains a number that never appears in `source`. */
export function hasUnsupportedNumber(text: string, source: string): boolean {
  const known = new Set(numbersIn(source));
  return numbersIn(text).some((n) => !known.has(n));
}

/**
 * Removes anything in the model's draft that the profile doesn't support:
 * unknown ids, skills you never listed, and numbers you never wrote.
 */
export function sanitizeTailored(
  tailored: Tailored,
  source: ResumeSource
): { tailored: Tailored; warnings: string[] } {
  const warnings: string[] = [];
  const profileText = buildSourceText(source, false);

  function keepBullets(bullets: string[], supportingText: string): string[] {
    const kept: string[] = [];
    for (const raw of bullets) {
      const bullet = raw.trim();
      if (!bullet) continue;
      if (hasUnsupportedNumber(bullet, supportingText)) {
        warnings.push(
          `Removed a bullet with a number that isn't in your profile: "${bullet.slice(0, 80)}"`
        );
        continue;
      }
      kept.push(bullet);
    }
    return kept.slice(0, 6);
  }

  const experienceById = new Map(source.experiences.map((e) => [e.id, e]));
  const seenExperience = new Set<string>();
  const experiences: Tailored["experiences"] = [];
  for (const t of tailored.experiences) {
    const src = experienceById.get(t.id);
    if (!src) {
      warnings.push("Ignored a work entry that isn't in your profile.");
      continue;
    }
    if (seenExperience.has(t.id)) continue;
    seenExperience.add(t.id);
    const bullets = keepBullets(
      t.bullets,
      [src.title, src.company, ...src.highlights].join(" ")
    );
    if (bullets.length > 0) experiences.push({ id: t.id, bullets });
  }

  const projectById = new Map(source.projects.map((p) => [p.id, p]));
  const seenProject = new Set<string>();
  const projects: Tailored["projects"] = [];
  for (const t of tailored.projects) {
    const src = projectById.get(t.id);
    if (!src) {
      warnings.push("Ignored a project that isn't in your profile.");
      continue;
    }
    if (seenProject.has(t.id)) continue;
    seenProject.add(t.id);
    const bullets = keepBullets(
      t.bullets,
      [src.name, src.description ?? "", ...src.techStack, ...src.highlights].join(" ")
    );
    projects.push({ id: t.id, bullets });
  }

  const skillMap = new Map(
    source.skills.map((g) => [
      g.category.toLowerCase(),
      {
        name: g.category,
        items: new Map(g.items.map((i) => [i.toLowerCase(), i])),
      },
    ])
  );
  const skills: Tailored["skills"] = [];
  for (const g of tailored.skills) {
    const category = skillMap.get(g.category.trim().toLowerCase());
    if (!category) {
      warnings.push(`Ignored a skills category that isn't in your profile: ${g.category}`);
      continue;
    }
    const items: string[] = [];
    for (const item of g.items) {
      const canonical = category.items.get(item.trim().toLowerCase());
      if (canonical && !items.includes(canonical)) items.push(canonical);
      else if (!canonical) warnings.push(`Removed a skill that isn't in your profile: ${item}`);
    }
    if (items.length > 0) skills.push({ category: category.name, items });
  }

  let headline = tailored.headline.trim();
  if (hasUnsupportedNumber(headline, profileText)) {
    warnings.push("Replaced the generated headline because it included a number that isn't in your profile.");
    headline = source.profile?.headline ?? "";
  }
  let summary = tailored.summary.trim();
  if (hasUnsupportedNumber(summary, profileText)) {
    warnings.push("Replaced the generated summary because it included a number that isn't in your profile.");
    summary = source.profile?.summary ?? "";
  }

  return {
    tailored: { headline, summary, experiences, projects: projects.slice(0, 4), skills },
    warnings,
  };
}

/** Builds the document that gets displayed. Facts come from the database. */
export function buildResumeDoc(
  source: ResumeSource,
  tailored: Tailored | null,
  fallback: { name: string; email: string }
): ResumeDoc {
  const p = source.profile;

  const bulletsById = new Map((tailored?.experiences ?? []).map((e) => [e.id, e.bullets]));
  const experiences = source.experiences.map((e) => ({
    title: e.title,
    company: e.company,
    location: e.location,
    dates: `${formatMonth(e.startDate)} to ${e.endDate ? formatMonth(e.endDate) : "Present"}`,
    bullets: bulletsById.get(e.id) ?? e.highlights,
  }));

  const projectById = new Map(source.projects.map((x) => [x.id, x]));
  const chosen =
    tailored && tailored.projects.length > 0
      ? tailored.projects.flatMap((t) => {
          const src = projectById.get(t.id);
          return src
            ? [{ src, bullets: t.bullets.length > 0 ? t.bullets : src.highlights.slice(0, 3) }]
            : [];
        })
      : source.projects.slice(0, 3).map((src) => ({ src, bullets: src.highlights.slice(0, 3) }));

  const projects = chosen.map(({ src, bullets }) => ({
    name: src.name,
    description: src.description,
    tech: src.techStack,
    links: [src.link, src.repoUrl].filter((v): v is string => Boolean(v)),
    bullets,
  }));

  const skills =
    tailored && tailored.skills.length > 0
      ? tailored.skills
      : source.skills.map((g) => ({ category: g.category, items: g.items }));

  return {
    name: p?.fullName || fallback.name,
    headline: tailored?.headline || p?.headline || null,
    contact: [p?.contactEmail || fallback.email, p?.phone, p?.location, p?.linkedin, p?.github, p?.website].filter(
      (v): v is string => Boolean(v)
    ),
    summary: tailored?.summary || p?.summary || null,
    experiences,
    projects,
    education: source.education.map((e) => ({
      degree: `${e.degree}${e.field ? `, ${e.field}` : ""}`,
      school: e.school,
      dates: rangeLabel(e.startDate, e.endDate),
      bullets: e.highlights,
    })),
    skills,
  };
}

/** Roughly what an ATS extracts from the resume. */
export function resumeToText(doc: ResumeDoc): string {
  const out: string[] = [doc.name];
  if (doc.headline) out.push(doc.headline);
  if (doc.contact.length > 0) out.push(doc.contact.join(" | "));

  const section = (title: string, lines: string[]) => {
    if (lines.length === 0) return;
    out.push("", title, ...lines);
  };

  section(HEADINGS.summary, doc.summary ? [doc.summary] : []);
  section(
    HEADINGS.experience,
    doc.experiences.flatMap((e) => [
      `${e.title}, ${e.company}`,
      `${e.dates}${e.location ? `, ${e.location}` : ""}`,
      ...e.bullets.map((b) => `- ${b}`),
    ])
  );
  section(
    HEADINGS.projects,
    doc.projects.flatMap((p) => [
      p.name,
      ...(p.description ? [p.description] : []),
      ...(p.tech.length > 0 ? [`Tech: ${p.tech.join(", ")}`] : []),
      ...p.links,
      ...p.bullets.map((b) => `- ${b}`),
    ])
  );
  section(
    HEADINGS.education,
    doc.education.flatMap((e) => [
      `${e.degree}, ${e.school}${e.dates ? `, ${e.dates}` : ""}`,
      ...e.bullets.map((b) => `- ${b}`),
    ])
  );
  section(
    HEADINGS.skills,
    doc.skills.map((g) => `${g.category}: ${g.items.join(", ")}`)
  );

  return out.join("\n");
}

export type AtsCheck = { id: string; label: string; passed: boolean; detail?: string };

export function runAtsChecks(doc: ResumeDoc, keywords: string[]) {
  const text = resumeToText(doc);
  const words = text.split(/\s+/).filter(Boolean).length;

  const checks: AtsCheck[] = [
    {
      id: "email",
      label: "Contact email is included",
      passed: doc.contact.some((c) => c.includes("@")),
    },
    {
      id: "phone",
      label: "Phone number is included",
      passed: doc.contact.some(
        (c) => !c.includes("@") && !c.includes("/") && c.replace(/\D/g, "").length >= 7
      ),
    },
    {
      id: "experience",
      label: "Work experience section has entries",
      passed: doc.experiences.length > 0,
    },
    {
      id: "skills",
      label: "Skills section has entries",
      passed: doc.skills.length > 0,
    },
    {
      id: "length",
      label: "Length is one to two pages",
      passed: words <= 800,
      detail: `${words} words`,
    },
  ];

  const unique = [
    ...new Map(
      keywords
        .map((k) => k.trim())
        .filter((k) => k && k.length <= 60)
        .map((k) => [k.toLowerCase(), k] as const)
    ).values(),
  ];
  const missing = findMissingKeywords(unique, text);
  const missingSet = new Set(missing.map((m) => m.toLowerCase()));
  const found = unique.filter((k) => !missingSet.has(k.toLowerCase()));

  return { checks, keywords: { total: unique.length, found, missing } };
}