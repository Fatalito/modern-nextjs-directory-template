import { resolve } from "node:path";
import { DB_FILE_NAME } from "./constants";

// For `db:seed`
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env");
  } catch {
    console.warn("No .env file found, using local database");
  }
}

// If DATABASE_URL starts with "file:" it's a local SQLite file; otherwise it's
// a remote libsql endpoint (Turso). Falls back to the local dev file when unset.
const databaseUrl =
  process.env.DATABASE_URL ?? `file:${resolve(process.cwd(), DB_FILE_NAME)}`;

const isFile = databaseUrl.startsWith("file:");

export const connectionConfig = {
  url: databaseUrl,
  ...(isFile ? {} : { authToken: process.env.DATABASE_AUTH_TOKEN }),
};
