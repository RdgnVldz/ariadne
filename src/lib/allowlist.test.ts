import { describe, expect, it } from "vitest";
import { isEmailAllowed, parseAllowedEmails } from "./allowlist";

describe("parseAllowedEmails", () => {
  it("trims, lowercases, and drops blanks", () => {
    expect(parseAllowedEmails(" Ada@Example.com, ,bob@example.com ")).toEqual([
      "ada@example.com",
      "bob@example.com",
    ]);
  });

  it("handles a missing value", () => {
    expect(parseAllowedEmails(undefined)).toEqual([]);
  });
});

describe("isEmailAllowed", () => {
  const allowed = ["ada@example.com"];

  it("allows listed emails regardless of case", () => {
    expect(isEmailAllowed("ADA@example.com", allowed)).toBe(true);
  });

  it("blocks emails that are not listed", () => {
    expect(isEmailAllowed("eve@example.com", allowed)).toBe(false);
  });

  it("allows everyone when the list contains *", () => {
    expect(isEmailAllowed("eve@example.com", ["*"])).toBe(true);
  });

  it("allows everyone when the list is empty, except in production mode", () => {
    expect(isEmailAllowed("eve@example.com", [])).toBe(true);
    expect(isEmailAllowed("eve@example.com", [], true)).toBe(false);
  });
});