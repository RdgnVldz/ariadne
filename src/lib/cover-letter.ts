import { z } from "zod";
import {
  buildSourceText,
  hasUnsupportedNumber,
  type ResumeSource,
} from "./resume";

// What the model is allowed to produce: body paragraphs only.
export const coverLetterDraftSchema = z.object({
  paragraphs: z.array(z.string()),
});

export const MAX_LETTER_LENGTH = 5000;

export const letterBodySchema = z
  .string()
  .trim()
  .min(1, "The letter can't be empty.")
  .max(MAX_LETTER_LENGTH, "Keep the letter under 5,000 characters.");

/**
 * Removes sentences with placeholders or numbers the profile doesn't support.
 * Works per sentence so the rest of the paragraph survives.
 */
export function sanitizeParagraphs(
  paragraphs: string[],
  source: ResumeSource
): { paragraphs: string[]; warnings: string[] } {
  const supporting = buildSourceText(source, false);
  const warnings: string[] = [];
  const kept: string[] = [];

  for (const raw of paragraphs) {
    const sentences = raw
      .trim()
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);
    const good: string[] = [];

    for (const sentence of sentences) {
      if (/[[\]]/.test(sentence)) {
        warnings.push(
          `Removed a sentence with a placeholder: "${sentence.slice(0, 80)}"`
        );
        continue;
      }
      if (hasUnsupportedNumber(sentence, supporting)) {
        warnings.push(
          `Removed a sentence with a number that isn't in your profile: "${sentence.slice(0, 80)}"`
        );
        continue;
      }
      good.push(sentence);
    }

    if (good.length > 0) kept.push(good.join(" "));
  }

  return { paragraphs: kept.slice(0, 4), warnings };
}

/** The greeting and sign-off are ours, not the model's. */
export function assembleLetter(paragraphs: string[], name: string): string {
  return [
    "Dear Hiring Manager,",
    ...paragraphs,
    `Sincerely,\n${name}`,
  ].join("\n\n");
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length; 
}