import { sql } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const profile = pgTable("profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  headline: text("headline"),
  contactEmail: text("contact_email"),
  phone: text("phone"),
  location: text("location"),
  linkedin: text("linkedin"),
  github: text("github"),
  website: text("website"),
  summary: text("summary"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const workExperience = pgTable(
  "work_experience",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    company: text("company").notNull(),
    title: text("title").notNull(),
    location: text("location"),
    startDate: text("start_date").notNull(), // "YYYY-MM"
    endDate: text("end_date"), // null means current role
    highlights: text("highlights")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("work_experience_user_idx").on(t.userId)]
);