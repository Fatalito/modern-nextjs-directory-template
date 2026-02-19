import { resolve } from "node:path";
import { createClient } from "@libsql/client";

// VITEST is set by the Vitest runner. Avoids capturing Next.js builds that run
// under NODE_ENV=test in CI but must connect to the real file-based DB.
const isTest = !!process.env.VITEST;

export const client = createClient({
  url: isTest
    ? "file::memory:?cache=shared"
    : `file:${resolve(process.cwd(), "sqlite.db")}`,
});
