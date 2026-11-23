// @vitest-environment node
import { inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "../db";
import { user } from "../db/schema";
import type { Analysis } from "./analysis";
import {
  countCoverLettersSince,
  getCoverLetter,
  saveCoverLetter,
  updateCoverLetterBody,
} from "./cover-letter-data";
import { createJob } from "./jobs-data";

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

describe("cover letter data (integration)", () => {
  let jobId: string;
  let letterId: string;

  beforeAll(async () => {
    await db.insert(user).values([
      { id: a, name: "User A", email: `a-${a}@example.com` },
      { id: b, name: "User B", email: `b-${b}@example.com` },
    ]);
    jobId = await createJob(a, sampleJob);
  });

  afterAll(async () => {
    // Deleting users also deletes their jobs and letters through the foreign keys.
    await db.delete(user).where(inArray(user.id, [a, b]));
  });

  it("saves a letter and returns it to its owner", async () => {
    expect(await getCoverLetter(a, jobId)).toBeNull();

    const id = await saveCoverLetter(a, jobId, {
      body: "Dear Hiring Manager,",
      warnings: [],
      model: "m",
    });
    expect(id).not.toBeNull();
    letterId = id!;

    const row = await getCoverLetter(a, jobId);
    expect(row?.body).toBe("Dear Hiring Manager,");
    expect(row?.edited).toBe(false);
  });

  it("lets the owner edit and marks the letter as edited", async () => {
    expect(await updateCoverLetterBody(a, letterId, "Edited text")).toBe(true);

    const row = await getCoverLetter(a, jobId);
    expect(row?.body).toBe("Edited text");
    expect(row?.edited).toBe(true);
  });

  it("does not let another user read, write, or edit your letter", async () => {
    expect(await getCoverLetter(b, jobId)).toBeNull();
    expect(
      await saveCoverLetter(b, jobId, { body: "Hacked", warnings: [], model: "m" })
    ).toBeNull();
    expect(await updateCoverLetterBody(b, letterId, "Hacked")).toBe(false);

    expect((await getCoverLetter(a, jobId))?.body).toBe("Edited text");
  });

  it("counts generations, not edits, and only for the owner", async () => {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    expect(await countCoverLettersSince(a, hourAgo)).toBe(1);
    expect(await countCoverLettersSince(b, hourAgo)).toBe(0);
  });
});