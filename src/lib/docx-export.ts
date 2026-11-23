import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { HEADINGS, type ResumeDoc } from "./resume";

export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const FONT = "Calibri";
const MARGIN = 1080; // 0.75 inch, in twentieths of a point

/** A safe, ASCII-only file name like Ada_Lovelace_Resume.docx */
export function docxFileName(name: string, kind: string): string {
  const base = `${name} ${kind}`
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${base || kind}.docx`;
}

function run(
  text: string,
  options: { bold?: boolean; italics?: boolean; size?: number } = {}
) {
  return new TextRun({ text, font: FONT, color: "000000", ...options });
}

function line(
  text: string,
  options: { bold?: boolean; italics?: boolean; after?: number } = {}
) {
  return new Paragraph({
    spacing: { after: options.after ?? 40 },
    children: [run(text, { bold: options.bold, italics: options.italics })],
  });
}

function bullet(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [run(text)],
  });
}

function heading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "808080", space: 1 },
    },
    children: [run(text, { bold: true, size: 24 })],
  });
}

function makeDocument(title: string, children: Paragraph[]) {
  return new Document({
    creator: "Ariadne",
    title,
    styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    sections: [
      {
        properties: {
          page: {
            margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
          },
        },
        children,
      },
    ],
  });
}

export function buildResumeDocx(doc: ResumeDoc): Document {
  const out: Paragraph[] = [];

  out.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 40 },
      children: [run(doc.name, { bold: true, size: 36 })],
    })
  );
  if (doc.headline) out.push(line(doc.headline));
  if (doc.contact.length > 0) out.push(line(doc.contact.join(" | ")));

  if (doc.summary) {
    out.push(heading(HEADINGS.summary), line(doc.summary));
  }

  if (doc.experiences.length > 0) {
    out.push(heading(HEADINGS.experience));
    for (const e of doc.experiences) {
      out.push(
        line(`${e.title}, ${e.company}`, { bold: true, after: 0 }),
        line(`${e.dates}${e.location ? `, ${e.location}` : ""}`),
        ...e.bullets.map(bullet)
      );
    }
  }

  if (doc.projects.length > 0) {
    out.push(heading(HEADINGS.projects));
    for (const p of doc.projects) {
      out.push(line(p.name, { bold: true, after: 0 }));
      if (p.description) out.push(line(p.description));
      if (p.tech.length > 0) out.push(line(`Tech: ${p.tech.join(", ")}`));
      if (p.links.length > 0) out.push(line(p.links.join(" | ")));
      out.push(...p.bullets.map(bullet));
    }
  }

  if (doc.education.length > 0) {
    out.push(heading(HEADINGS.education));
    for (const e of doc.education) {
      out.push(
        line(e.degree, { bold: true, after: 0 }),
        line(`${e.school}${e.dates ? `, ${e.dates}` : ""}`),
        ...e.bullets.map(bullet)
      );
    }
  }

  if (doc.skills.length > 0) {
    out.push(heading(HEADINGS.skills));
    for (const g of doc.skills) {
      out.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            run(`${g.category}: `, { bold: true }),
            run(g.items.join(", ")),
          ],
        })
      );
    }
  }

  return makeDocument(`${doc.name} Resume`, out);
}

export function buildLetterDocx(input: {
  name: string;
  contact: string[];
  body: string;
}): Document {
  const out: Paragraph[] = [
    new Paragraph({
      spacing: { after: 40 },
      children: [run(input.name, { bold: true, size: 32 })],
    }),
  ];
  if (input.contact.length > 0) {
    out.push(line(input.contact.join(" | "), { after: 240 }));
  }

  for (const block of input.body.split(/\n{2,}/)) {
    const lines = block.split("\n");
    out.push(
      new Paragraph({
        spacing: { after: 200 },
        children: lines.map(
          (text, i) =>
            new TextRun({
              text,
              font: FONT,
              color: "000000",
              break: i > 0 ? 1 : undefined,
            })
        ),
      })
    );
  }

  return makeDocument(`${input.name} Cover Letter`, out);
}

export function toDocxBuffer(document: Document): Promise<Buffer> {
  return Packer.toBuffer(document);
}