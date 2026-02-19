import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";

const dbFileAbs = fileURLToPath(new URL("./sqlite.db", import.meta.url));

export default defineConfig({
  schema: "./src/shared/api/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: `file:${dbFileAbs}`,
  },
});
