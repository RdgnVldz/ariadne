// @vitest-environment node
import { eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "../db";
import { profile, user } from "../db/schema";
import {
  createExperience,
  deleteExperience,
  getExperience,
  getProfile,
  listExperiences,
  saveProfile,
  updateExperience,
} from "./profile-data";

const a = crypto.randomUUID();
const b = crypto.randomUUID();

const role = {
  company: "Acme",
  title: "Engineer",
  location: null,
  startDate: "2022-03",
  endDate: null,
  highlights: ["Built things"],
};

describe("profile data (integration)", () => {
  beforeAll(async () => {
    await db.insert(user).values([
      { id: a, name: "User A", email: `a-${a}@example.com` },
      { id: b, name: "User B", email: `b-${b}@example.com` },
    ]);
  });

  afterAll(async () => {
    // Deleting the users also deletes their rows through the foreign keys.
    await db.delete(user).where(inArray(user.id, [a, b]));
  });

  it("keeps a single profile row per user", async () => {
    const base = {
      fullName: "User A",
      headline: null,
      contactEmail: null,
      phone: null,
      location: null,
      linkedin: null,
      github: null,
      website: null,
      summary: null,
    };
    await saveProfile(a, base);
    await saveProfile(a, { ...base, headline: "Engineer" });

    expect((await getProfile(a))?.headline).toBe("Engineer");
    const rows = await db.select().from(profile).where(eq(profile.userId, a));
    expect(rows).toHaveLength(1);
  });

  it("does not let another user read, change, or delete an entry", async () => {
    const id = await createExperience(a, role);

    expect(await getExperience(b, id)).toBeNull();
    expect(await updateExperience(b, id, { ...role, company: "Hacked" })).toBe(false);
    expect(await deleteExperience(b, id)).toBe(false);
    expect(await listExperiences(b)).toHaveLength(0);

    expect((await getExperience(a, id))?.company).toBe("Acme");
  });

  it("lets the owner update and delete", async () => {
    const id = await createExperience(a, role);

    expect(await updateExperience(a, id, { ...role, company: "Globex" })).toBe(true);
    expect((await getExperience(a, id))?.company).toBe("Globex");

    expect(await deleteExperience(a, id)).toBe(true);
    expect(await getExperience(a, id)).toBeNull();
  });
});