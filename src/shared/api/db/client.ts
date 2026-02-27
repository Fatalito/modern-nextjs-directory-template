import { createClient } from "@libsql/client";
import { connectionConfig } from "./connection";

// VITEST is set by the Vitest runner. Avoids capturing Next.js builds that run
// under NODE_ENV=test in CI but must connect to the real file-based DB.
const isTest = !!process.env.VITEST;

export const client = createClient(
  isTest ? { url: "file::memory:?cache=shared" } : connectionConfig,
);
