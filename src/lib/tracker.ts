import { z } from "zod";
import { STATUSES } from "./job-status";
import { isHttpUrl } from "./profile-validation";

export const statusSchema = z.enum(STATUSES);

const optionalDate = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || z.iso.date().safeParse(v).success,
    "Choose a valid date."
  )
  .transform((v) => v || null);

export const trackerDetailsSchema = z.object({
  jobUrl: z
    .string()
    .trim()
    .max(500, "Keep the link under 500 characters.")
    .refine(
      (v) => v === "" || isHttpUrl(v),
      "Enter a full link, like https://example.com."
    )
    .transform((v) => v || null),
  notes: z
    .string()
    .trim()
    .max(2000, "Keep notes under 2000 characters.")
    .transform((v) => v || null),
  appliedOn: optionalDate,
  followUpOn: optionalDate,
});

export type TrackerDetails = z.output<typeof trackerDetailsSchema>;