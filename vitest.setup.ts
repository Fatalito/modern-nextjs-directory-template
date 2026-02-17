import { cleanup } from "@testing-library/react";
import { getTableName, is, sql } from "drizzle-orm";
import { afterEach, beforeAll, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { SQLiteTable } from "drizzle-orm/sqlite-core";
import { db } from "@/shared/api";
import * as schema from "@/shared/api/db/schema";

beforeAll(async () => {
  migrate(db, { migrationsFolder: "./drizzle" });
});

beforeEach(async () => {
  const tableNames = Object.values(schema)
    .filter((entry: unknown): entry is SQLiteTable => is(entry, SQLiteTable))
    .map((table: unknown) => getTableName(table as SQLiteTable));

  db.run(sql.raw(`PRAGMA foreign_keys = OFF`));
  db.transaction((tx) => {
    for (const name of tableNames) {
      tx.run(sql.raw(`DELETE FROM "${name}"`));
    }
  });
  db.run(sql.raw(`PRAGMA foreign_keys = ON`));
});

// Automatically unmount React trees after each test to prevent memory leaks
// and state bleeding between tests.
afterEach(() => {
  cleanup();
});
