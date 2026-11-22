import { describe, expect, it } from "vitest";
import {
  buildResumeDoc,
  hasUnsupportedNumber,
  resumeToText,
  runAtsChecks,
  sanitizeTailored,
  type ResumeSource,
  type Tailored,
} from "./resume";

const source: ResumeSource = {
  profile: {
    fullName: "Ada Lovelace",
    headline: "Full-stack engineer",
    contactEmail: "ada@example.com",
    phone: "+63 912 345 6789",
    location: "Manila, Philippines",
    linkedin: null,
    github: "https://github.com/ada",
    website: null,
    summary: "Engineer with 4 years of experience.",
  },
  experiences: [
    {
      id: "e1",
      company: "Acme",
      title: "Frontend Developer",
      location: null,
      startDate: "2022-03",
      endDate: null,
      highlights: ["Built a dashboard used by 200 customers", "Cut load time by 40%"],
    },
    {
      id: "e2",
      company: "Globex",
      title: "Junior Developer",
      location: "Remote",
      startDate: "2020-01",
      endDate: "2022-02",
      highlights: ["Maintained WordPress sites"],
    },
  ],
  projects: [
    {
      id: "p1",
      name: "Atlas",
      link: null,
      repoUrl: "https://github.com/ada/atlas",
      description: "Interview coach.",
      techStack: ["Next.js"],
      highlights: ["Deployed on Vercel"],
    },
  ],
  education: [
    {
      school: "State University",
      degree: "BSc Information Technology",
      field: null,
      startDate: null,
      endDate: "2019-06",
      highlights: [],
    },
  ],
  skills: [
    { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS"] },
    { category: "Backend", items: ["Node.js"] },
  ],
};

describe("hasUnsupportedNumber", () => {
  it("accepts numbers that appear in the source", () => {
    expect(hasUnsupportedNumber("Cut load time by 40%", "Cut load time by 40%")).toBe(false);
  });

  it("flags numbers that don't", () => {
    expect(hasUnsupportedNumber("Cut load time by 60%", "Cut load time by 40%")).toBe(true);
  });

  it("allows text with no numbers", () => {
    expect(hasUnsupportedNumber("Led a team", "anything")).toBe(false);
  });
});

describe("sanitizeTailored", () => {
  const draft: Tailored = {
    headline: "Frontend Engineer",
    summary: "Engineer with 9 years of experience.",
    experiences: [
      {
        id: "e1",
        bullets: ["Built a dashboard used by 200 customers", "Increased revenue by 300%"],
      },
      { id: "nope", bullets: ["Invented job"] },
    ],
    projects: [
      { id: "p1", bullets: ["Deployed on Vercel"] },
      { id: "ghost", bullets: [] },
    ],
    skills: [
      { category: "frontend", items: ["react", "Kubernetes"] },
      { category: "Cloud", items: ["AWS"] },
    ],
  };

  it("removes anything the profile doesn't support", () => {
    const { tailored, warnings } = sanitizeTailored(draft, source);

    expect(tailored.experiences).toEqual([
      { id: "e1", bullets: ["Built a dashboard used by 200 customers"] },
    ]);
    expect(tailored.projects.map((p) => p.id)).toEqual(["p1"]);
    expect(tailored.skills).toEqual([{ category: "Frontend", items: ["React"] }]);
    expect(tailored.summary).toBe("Engineer with 4 years of experience.");
    expect(tailored.headline).toBe("Frontend Engineer");
    expect(warnings.length).toBeGreaterThan(0);
  });
});

describe("buildResumeDoc", () => {
  const fallback = { name: "Account Name", email: "account@example.com" };

  it("always includes every work experience, newest first as stored", () => {
    const doc = buildResumeDoc(
      source,
      {
        headline: "",
        summary: "",
        experiences: [{ id: "e1", bullets: ["Tailored bullet"] }],
        projects: [],
        skills: [],
      },
      fallback
    );

    expect(doc.experiences.map((e) => e.company)).toEqual(["Acme", "Globex"]);
    expect(doc.experiences[0].bullets).toEqual(["Tailored bullet"]);
    expect(doc.experiences[1].bullets).toEqual(["Maintained WordPress sites"]);
    expect(doc.experiences[0].dates).toBe("Mar 2022 to Present");
  });

  it("works without a tailored draft", () => {
    const doc = buildResumeDoc(source, null, fallback);
    expect(doc.name).toBe("Ada Lovelace");
    expect(doc.summary).toBe("Engineer with 4 years of experience.");
    expect(doc.projects[0].name).toBe("Atlas");
    expect(doc.skills).toHaveLength(2);
  });

  it("falls back to the account email when the profile has none", () => {
    const doc = buildResumeDoc(
      { ...source, profile: { ...source.profile!, contactEmail: null } },
      null,
      fallback
    );
    expect(doc.contact[0]).toBe("account@example.com");
  });
});

describe("resumeToText and runAtsChecks", () => {
  const doc = buildResumeDoc(source, null, { name: "x", email: "x@example.com" });

  it("uses standard section headings", () => {
    const text = resumeToText(doc);
    for (const heading of ["Summary", "Work Experience", "Projects", "Education", "Skills"]) {
      expect(text).toContain(heading);
    }
  });

  it("passes the basic checks for a complete resume", () => {
    const { checks } = runAtsChecks(doc, []);
    expect(checks.every((c) => c.passed)).toBe(true);
  });

  it("flags a missing phone number", () => {
    const noPhone = { ...doc, contact: doc.contact.filter((c) => !c.includes("+63")) };
    const phone = runAtsChecks(noPhone, []).checks.find((c) => c.id === "phone");
    expect(phone?.passed).toBe(false);
  });

  it("reports which posting keywords are covered", () => {
    const { keywords } = runAtsChecks(doc, ["React", "Kubernetes", "react"]);
    expect(keywords.total).toBe(2);
    expect(keywords.found).toEqual(["React"]);
    expect(keywords.missing).toEqual(["Kubernetes"]);
  });
});