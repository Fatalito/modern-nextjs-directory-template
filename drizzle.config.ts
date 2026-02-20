import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";
import { DB_FILE_NAME } from "@/shared/api/db/constants";

const dbFileAbs = fileURLToPath(new URL(`./${DB_FILE_NAME}`, import.meta.url));

export default defineConfig({
  schema: "./src/shared/api/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: `file:${dbFileAbs}`,
  },
});
