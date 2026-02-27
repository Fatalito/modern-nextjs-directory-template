import { defineConfig } from "drizzle-kit";
import { connectionConfig } from "./src/shared/api/db/connection";

export default defineConfig({
  schema: "./src/shared/api/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: connectionConfig,
});
