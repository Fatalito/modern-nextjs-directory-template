import path from "node:path";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/shared/api/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: path.join(__dirname, "sqlite.db"),
  },
});
