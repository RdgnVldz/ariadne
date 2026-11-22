// @vitest-environment node
import { inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "../db";
import { user } from "../db/schema";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from "./profile-data";

const a = crypto.randomUUID();
const b = crypto.randomUUID();

const sample = {
  name: "Atlas",
  link: null,
  repoUrl: null,
  description: null,
  techStack: ["Next.js"],
  highlights: [],
};

describe("projects data (integration)", () => {
  beforeAll(async () => {
    await db.insert(user).values([
      { id: a, name: "User A", email: `a-${a}@example.com` },
      { id: b, name: "User B", email: `b-${b}@example.com` },
    ]);
  });

  afterAll(async () => {
    await db.delete(user).where(inArray(user.id, [a, b]));
  });

  it("does not let another user read, change, or delete a project", async () => {
    const id = await createProject(a, sample);

    expect(await getProject(b, id)).toBeNull();
    expect(await updateProject(b, id, { ...sample, name: "Hacked" })).toBe(false);
    expect(await deleteProject(b, id)).toBe(false);
    expect(await listProjects(b)).toHaveLength(0);

    expect((await getProject(a, id))?.name).toBe("Atlas");
  });

  it("lets the owner update and delete", async () => {
    const id = await createProject(a, sample);

    expect(await updateProject(a, id, { ...sample, name: "Atlas 2" })).toBe(true);
    expect((await getProject(a, id))?.name).toBe("Atlas 2");

    expect(await deleteProject(a, id)).toBe(true);
    expect(await getProject(a, id)).toBeNull();
  });

  it("stores the technology list as an array", async () => {
    const id = await createProject(a, {
      ...sample,
      techStack: ["Next.js", "PostgreSQL"],
    });
    expect((await getProject(a, id))?.techStack).toEqual([
      "Next.js",
      "PostgreSQL",
    ]);
  });
});