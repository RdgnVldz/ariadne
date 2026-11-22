import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { Analysis } from "../lib/analysis";
import { user } from "./auth-schema";

export const job = pgTable(
  "job",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    company: text("company").notNull(),
    postingText: text("posting_text").notNull(),
    analysis: jsonb("analysis").$type<Analysis>().notNull(),
    missingKeywords: text("missing_keywords")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    fitScore: integer("fit_score"),
    model: text("model").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("job_user_created_idx").on(t.userId, t.createdAt)]
);