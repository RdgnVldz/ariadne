// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  buildLetterDocx,
  buildResumeDocx,
  docxFileName,
  toDocxBuffer,
} from "./docx-export";
import type { ResumeDoc } from "./resume";

const doc: ResumeDoc = {
  name: "Ada Lovelace",
  headline: "Full-stack engineer",
  contact: ["ada@example.com", "Manila, Philippines"],
  summary: "Engineer.",
  experiences: [
    {
      title: "Frontend Developer",
      company: "Acme",
      location: null,
      dates: "Mar 2022 to Present",
      bullets: ["Built a dashboard"],
    },
  ],
  projects: [],
  education: [],
  skills: [{ category: "Frontend", items: ["React"] }],
};

// A .docx file is a zip archive, and every zip starts with the bytes "PK".
function isZip(buffer: Buffer) {
  return buffer.subarray(0, 2).toString() === "PK";
}

describe("docx export", () => {
  it("builds a resume as a valid Word file", async () => {
    const buffer = await toDocxBuffer(buildResumeDocx(doc));
    expect(isZip(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("builds a cover letter as a valid Word file", async () => {
    const buffer = await toDocxBuffer(
      buildLetterDocx({
        name: "Ada Lovelace",
        contact: doc.contact,
        body: "Dear Hiring Manager,\n\nHello.\n\nSincerely,\nAda Lovelace",
      })
    );
    expect(isZip(buffer)).toBe(true);
  });

  it("handles a resume with only the required parts", async () => {
    const minimal: ResumeDoc = {
      name: "Ada",
      headline: null,
      contact: [],
      summary: null,
      experiences: [],
      projects: [],
      education: [],
      skills: [],
    };
    expect(isZip(await toDocxBuffer(buildResumeDocx(minimal)))).toBe(true);
  });
});

describe("docxFileName", () => {
  it("makes a safe ASCII name", () => {
    expect(docxFileName("Ada Lovelace", "Resume")).toBe("Ada_Lovelace_Resume.docx");
  });

  it("removes characters that don't belong in a file name", () => {
    expect(docxFileName('A"da/\\ <Lovelace>', "Cover Letter")).toBe(
      "A_da_Lovelace_Cover_Letter.docx"
    );
  });

  it("falls back when nothing safe is left", () => {
    expect(docxFileName("", "Resume")).toBe("Resume.docx");
  });
});