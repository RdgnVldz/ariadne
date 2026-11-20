// @vitest-environment node
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "../db";
import { account, user } from "../db/schema";
import { auth } from "./auth";

const email = `test-${crypto.randomUUID()}@example.com`;
const password = "correct-horse-battery";

function post(path: string, body: unknown) {
  return auth.handler(
    new Request(`http://localhost:3000/api/auth${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify(body),
    })
  );
}

describe("auth (integration)", () => {
  let signUpResponse: Response;

  beforeAll(async () => {
    signUpResponse = await post("/sign-up/email", {
      name: "Test User",
      email,
      password,
    });
  });

  afterAll(async () => {
    await db.delete(user).where(eq(user.email, email));
  });

  it("signs a new user up and starts a session", () => {
    expect(signUpResponse.ok).toBe(true);
    expect(signUpResponse.headers.get("set-cookie")).toContain(
      "session_token"
    );
  });

  it("stores a hash, never the plain password", async () => {
    const [u] = await db.select().from(user).where(eq(user.email, email));
    const [a] = await db.select().from(account).where(eq(account.userId, u.id));
    expect(a.password).toBeTruthy();
    expect(a.password).not.toContain(password);
  });

  it("signs in with the right password", async () => {
    const res = await post("/sign-in/email", { email, password });
    expect(res.ok).toBe(true);
  });

  it("rejects the wrong password", async () => {
    const res = await post("/sign-in/email", {
      email,
      password: "not-the-password",
    });
    expect(res.ok).toBe(false);
  });

  it("rejects a duplicate email", async () => {
    const res = await post("/sign-up/email", {
      name: "Someone Else",
      email,
      password,
    });
    expect(res.ok).toBe(false);
  });
});