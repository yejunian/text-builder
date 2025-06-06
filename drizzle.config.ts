import { defineConfig } from "drizzle-kit";

import { ENV_DATABASE_URL } from "@/utils/server/env";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: ENV_DATABASE_URL,
  },
});
