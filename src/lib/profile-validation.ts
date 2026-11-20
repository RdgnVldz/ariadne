import { z } from "zod";

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .transform((v) => v || null);

const optionalLink = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || isHttpUrl(v),
    "Enter a full link, like https://example.com."
  )
  .transform((v) => v || null);

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Choose a valid month.");

export function parseHighlights(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name.").max(100),
  headline: optionalText(120),
  contactEmail: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || z.email().safeParse(v).success,
      "Enter a valid email address."
    )
    .transform((v) => v || null),
  phone: optionalText(40),
  location: optionalText(100),
  linkedin: optionalLink,
  github: optionalLink,
  website: optionalLink,
  summary: optionalText(1000),
});

export const experienceSchema = z
  .object({
    company: z.string().trim().min(1, "Enter the company name.").max(120),
    title: z.string().trim().min(1, "Enter your job title.").max(120),
    location: optionalText(100),
    startDate: month,
    endDate: z
      .string()
      .trim()
      .transform((v) => v || null)
      .pipe(month.nullable()),
    highlights: z
      .string()
      .transform(parseHighlights)
      .pipe(
        z
          .array(z.string().max(400, "Keep each bullet under 400 characters."))
          .max(12, "Use 12 bullets or fewer.")
      ),
  })
  .refine((d) => d.endDate === null || d.endDate >= d.startDate, {
    message: "The end date can't be before the start date.",
    path: ["endDate"],
  });

export type ProfileInput = z.output<typeof profileSchema>;
export type ExperienceInput = z.output<typeof experienceSchema>;

export function formToObject(form: FormData): Record<string, string> {
  return Object.fromEntries(
    Array.from(form.entries()).map(([key, value]) => [
      key,
      typeof value === "string" ? value : "",
    ])
  );
}