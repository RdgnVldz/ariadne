// @vitest-environment node
import { inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "../db";
import { user } from "../db/schema";
import type { Analysis } from "./analysis";
import {
  countJobsSince,
  createJob,
  deleteJob,
  getJob,
  listJobs,
} from "./jobs-data";

const a = crypto.randomUUID();
const b = crypto.randomUUID();

const analysis: Analysis = {
  jobTitle: "Frontend Engineer",
  company: "Acme",
  seniority: "mid",
  summary: "Builds the web app.",
  requirements: [
    { requirement: "React", importance: "required", status: "strong", evidence: "Skills: React" },
  ],
  keywords: ["React", "GraphQL"],
};

const sample = {
  title: "Frontend Engineer",
  company: "Acme",
  postingText: "A posting.",
  analysis,
  missingKeywords: ["GraphQL"],
  fitScore: 100,
  model: "test-model",
};

describe("jobs data (integration)", () => {
  beforeAll(async () => {
    await db.insert(user).values([
      { id: a, name: "User A", email: `a-${a}@example.com` },
      { id: b, name: "User B", email: `b-${b}@example.com` },
    ]);
  });

  afterAll(async () => {
    await db.delete(user).where(inArray(user.id, [a, b]));
  });

  it("stores and returns the analysis for its owner", async () => {
    const id = await createJob(a, sample);
    const row = await getJob(a, id);
    expect(row?.analysis.requirements[0].requirement).toBe("React");
    expect(row?.missingKeywords).toEqual(["GraphQL"]);
    expect(row?.fitScore).toBe(100);
  });

  it("does not let another user read or delete a job", async () => {
    const id = await createJob(a, sample);

    expect(await getJob(b, id)).toBeNull();
    expect(await deleteJob(b, id)).toBe(false);
    expect(await listJobs(b)).toHaveLength(0);

    expect(await getJob(a, id)).not.toBeNull();
    expect(await deleteJob(a, id)).toBe(true);
  });

  it("counts only a user's own recent jobs", async () => {
    await createJob(b, sample);
    await createJob(b, sample);

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    expect(await countJobsSince(b, hourAgo)).toBe(2);
    expect(await countJobsSince(b, tomorrow)).toBe(0);
  });
});