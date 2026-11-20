import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Local default points at the throwaway Docker database; CI overrides it.
process.env.TEST_DATABASE_URL ??=
  "postgres://ariadne:ariadne_dev@localhost:5434/ariadne_test";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globalSetup: ["./tests/global-setup.ts"],
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL!,
      BETTER_AUTH_SECRET: "test-secret-only-for-automated-tests-0123456789",
      BETTER_AUTH_URL: "http://localhost:3000",
    },
  },
});