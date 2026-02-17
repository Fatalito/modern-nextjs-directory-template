import Database from "better-sqlite3";
import {
  type BetterSQLite3Database,
  drizzle,
} from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const isTest = process.env.NODE_ENV === "test";

const sqlite = new Database(isTest ? ":memory:" : "sqlite.db", {
  verbose: isTest ? undefined : console.log,
});
export const db = drizzle(sqlite, { schema });
export type DB = BetterSQLite3Database<typeof schema>;
