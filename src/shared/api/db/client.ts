import { resolve } from "node:path";
import { createClient } from "@libsql/client";

const isTest = process.env.NODE_ENV === "test";

export const client = createClient({
  url: isTest
    ? "file::memory:?cache=shared"
    : `file:${resolve(process.cwd(), "sqlite.db")}`,
});
