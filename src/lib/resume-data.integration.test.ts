// @vitest-environment node
import { inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "../db";
import { user } from "../db/schema";
import type { Analysis } from "./analysis";
import { createJob } from "./jobs-data";
import type { Tailored } from "./resume";
import { countResumesSince, getResume, saveResume } from "./resume-data";

const a = crypto.randomUUID();
const b = crypto.randomUUID();

const analysis: Analysis = {
  jobTitle: "Frontend Engineer",
  company: "Acme",
  seniority: "mid",
  summary: "Builds the web app.",
  requirements: [],
  keywords: [],
};

const sampleJob = {
  title: "Frontend Engineer",
  company: "Acme",
  postingText: "A posting.",
  analysis,
  missingKeywords: [],
  fitScore: null,
  model: "test-model",
};

function tailored(headline: string): Tailored {
  return { headline, summary: "", experiences: [], projects: [], skills: [] };
}

describe("resume data (integration)", () => {
  let jobId: string;

  beforeAll(async () => {
    await db.insert(user).values([
      { id: a, name: "User A", email: `a-${a}@example.com` },
      { id: b, name: "User B", email: `b-${b}@example.com` },
    ]);
    jobId = await createJob(a, sampleJob);
  });

  afterAll(async () => {
    // Deleting users also deletes their jobs and resumes through the foreign keys.
    await db.delete(user).where(inArray(user.id, [a, b]));
  });

  it("returns the newest resume for the owner", async () => {
    expect(await getResume(a, jobId)).toBeNull();

    await saveResume(a, jobId, { tailored: tailored("First"), warnings: [], model: "m" });
    await saveResume(a, jobId, { tailored: tailored("Second"), warnings: ["w"], model: "m" });

    const row = await getResume(a, jobId);
    expect(row?.tailored.headline).toBe("Second");
    expect(row?.warnings).toEqual(["w"]);
  });

  it("does not let another user read or write resumes for your job", async () => {
    expect(await getResume(b, jobId)).toBeNull();

    const saved = await saveResume(b, jobId, {
      tailored: tailored("Hacked"),
      warnings: [],
      model: "m",
    });
    expect(saved).toBe(false);
    expect((await getResume(a, jobId))?.tailored.headline).toBe("Second");
  });

  it("counts only a user's own recent resumes", async () => {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    expect(await countResumesSince(a, hourAgo)).toBe(2);
    expect(await countResumesSince(b, hourAgo)).toBe(0);
  });
});