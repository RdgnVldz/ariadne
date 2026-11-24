import { describe, expect, it } from "vitest";
import { followUpsDue, profileChecklist, stageCounts } from "./dashboard";
import type { ResumeSource } from "./resume";

const empty: ResumeSource = {
  profile: null,
  experiences: [],
  projects: [],
  education: [],
  skills: [],
};

const complete: ResumeSource = {
  profile: {
    fullName: "Ada Lovelace",
    headline: null,
    contactEmail: "ada@example.com",
    phone: "+63 912 345 6789",
    location: null,
    linkedin: null,
    github: null,
    website: null,
    summary: "Engineer.",
  },
  experiences: [
    {
      id: "e1",
      company: "Acme",
      title: "Developer",
      location: null,
      startDate: "2022-03",
      endDate: null,
      highlights: ["Built things"],
    },
  ],
  projects: [
    {
      id: "p1",
      name: "Atlas",
      link: null,
      repoUrl: null,
      description: null,
      techStack: [],
      highlights: [],
    },
  ],
  education: [
    {
      school: "State University",
      degree: "BSc",
      field: null,
      startDate: null,
      endDate: null,
      highlights: [],
    },
  ],
  skills: [{ category: "Frontend", items: ["React"] }],
};

describe("profileChecklist", () => {
  it("shows nothing done for an empty profile", () => {
    const items = profileChecklist(empty);
    expect(items.every((item) => !item.done)).toBe(true);
  });

  it("shows everything done for a complete profile", () => {
    const items = profileChecklist(complete);
    expect(items.every((item) => item.done)).toBe(true);
  });

  it("asks for highlights when a role has none", () => {
    const source: ResumeSource = {
      ...complete,
      experiences: [{ ...complete.experiences[0], highlights: [] }],
    };
    const items = profileChecklist(source);
    expect(items.find((i) => i.id === "experience")?.done).toBe(true);
    expect(items.find((i) => i.id === "highlights")?.done).toBe(false);
  });

  it("needs a phone number to count the contact details as done", () => {
    const source: ResumeSource = {
      ...complete,
      profile: { ...complete.profile!, phone: null },
    };
    expect(profileChecklist(source).find((i) => i.id === "contact")?.done).toBe(false);
  });
});

describe("stageCounts", () => {
  it("counts jobs per stage, including empty stages", () => {
    const counts = stageCounts([
      { status: "saved" },
      { status: "saved" },
      { status: "applied" },
    ]);
    expect(counts).toEqual({
      saved: 2,
      applied: 1,
      interviewing: 0,
      offer: 0,
      rejected: 0,
    });
  });
});

describe("followUpsDue", () => {
  const jobs = [
    { id: "1", status: "applied", followUpOn: "2026-11-23" },
    { id: "2", status: "interviewing", followUpOn: "2026-11-01" },
    { id: "3", status: "applied", followUpOn: "2026-12-01" },
    { id: "4", status: "rejected", followUpOn: "2026-11-01" },
    { id: "5", status: "saved", followUpOn: "2026-11-01" },
    { id: "6", status: "applied", followUpOn: null },
  ] as const;

  it("includes active applications due today or overdue", () => {
    const due = followUpsDue([...jobs], "2026-11-23");
    expect(due.map((j) => j.id)).toEqual(["1", "2"]);
  });

  it("ignores future dates, closed jobs, saved jobs, and missing dates", () => {
    const due = followUpsDue([...jobs], "2026-10-01");
    expect(due).toEqual([]);
  });
});