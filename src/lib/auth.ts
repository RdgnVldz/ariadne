import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { db } from "../db";
import * as schema from "../db/schema";
import { isEmailAllowed, parseAllowedEmails } from "./allowlist";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => {
          const allowed = parseAllowedEmails(process.env.ALLOWED_EMAILS);
          const production = process.env.NODE_ENV === "production";
          if (!isEmailAllowed(newUser.email, allowed, production)) {
            throw new APIError("FORBIDDEN", {
              message: "Sign-ups are invitation only right now.",
            });
          }
        },
      },
    },
  },
  plugins: [nextCookies()], // keep this last
});