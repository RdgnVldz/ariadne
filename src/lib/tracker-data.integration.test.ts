// @vitest-environment node
import { inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "../db";
import { user } from "../db/schema";
import type { Analysis } from "./analysis";
import { createJob, getJob } from "./jobs-data";
import {
  listJobEvents,
  listTrackerJobs,
  updateJobDetails,
  updateJobStatus,
} from "./tracker-data";

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

const details = {
  jobUrl: "https://example.com/jobs/1",
  notes: "Recruiter: Sam",
  appliedOn: null,
  followUpOn: "2026-12-01",
};

describe("tracker data (integration)", () => {
  beforeAll(async () => {
    await db.insert(user).values([
      { id: a, name: "User A", email: `a-${a}@example.com` },
      { id: b, name: "User B", email: `b-${b}@example.com` },
    ]);
  });

  afterAll(async () => {
    // Deleting users also deletes their jobs and events through the foreign keys.
    await db.delete(user).where(inArray(user.id, [a, b]));
  });

  it("starts every job as saved", async () => {
    const id = await createJob(a, sampleJob);
    const row = await getJob(a, id);
    expect(row?.status).toBe("saved");
    expect(row?.appliedOn).toBeNull();
  });

  it("records a stage change and fills in the applied date", async () => {
    const id = await createJob(a, sampleJob);

    expect(await updateJobStatus(a, id, "applied", "2026-11-23")).toBe(true);

    const row = await getJob(a, id);
    expect(row?.status).toBe("applied");
    expect(row?.appliedOn).toBe("2026-11-23");

    const events = await listJobEvents(a, id);
    expect(events).toHaveLength(1);
    expect(events[0].fromStatus).toBe("saved");
    expect(events[0].toStatus).toBe("applied");
  });

  it("keeps the first applied date and ignores a repeated stage", async () => {
    const id = await createJob(a, sampleJob);
    await updateJobStatus(a, id, "applied", "2026-11-23");
    await updateJobStatus(a, id, "applied", "2026-11-24"); // same stage
    await updateJobStatus(a, id, "interviewing", "2026-11-25");
    await updateJobStatus(a, id, "applied", "2026-12-01"); // back again

    expect((await getJob(a, id))?.appliedOn).toBe("2026-11-23");
    expect(await listJobEvents(a, id)).toHaveLength(3);
  });

  it("does not let another user change or read your job", async () => {
    const id = await createJob(a, sampleJob);

    expect(await updateJobStatus(b, id, "offer", "2026-11-23")).toBe(false);
    expect(await updateJobDetails(b, id, details)).toBe(false);
    expect(await listJobEvents(b, id)).toEqual([]);
    expect((await listTrackerJobs(b)).map((j) => j.id)).not.toContain(id);

    expect((await getJob(a, id))?.status).toBe("saved");
  });

  it("saves application details for the owner", async () => {
    const id = await createJob(a, sampleJob);

    expect(await updateJobDetails(a, id, details)).toBe(true);

    const row = await getJob(a, id);
    expect(row?.jobUrl).toBe("https://example.com/jobs/1");
    expect(row?.notes).toBe("Recruiter: Sam");
    expect(row?.followUpOn).toBe("2026-12-01");
  });
});