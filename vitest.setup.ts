import { cleanup } from "@testing-library/react";
import { getTableName, is, sql } from "drizzle-orm";
import { afterEach, beforeAll, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { migrate } from "drizzle-orm/libsql/migrator";
import { SQLiteTable } from "drizzle-orm/sqlite-core";
import { db, schema } from "@/shared/api";

beforeAll(async () => {
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
  } catch (error) {
    console.error("❌ Migration failed during test setup:", error);
    throw error;
  }
});

beforeEach(async () => {
  const tableNames = Object.values(schema)
    .filter((entry: unknown): entry is SQLiteTable => is(entry, SQLiteTable))
    .map((table) => getTableName(table as SQLiteTable));
  await db.run(sql`PRAGMA foreign_keys = OFF`);
  try {
    await db.transaction(async (tx) => {
      for (const name of tableNames) {
        await tx.run(sql.raw(`DELETE FROM "${name}"`));
      }
    });
  } finally {
    await db.run(sql.raw(`PRAGMA foreign_keys = ON`));
  }
});

// Automatically unmount React trees after each test to prevent memory leaks
// and state bleeding between tests.
afterEach(() => {
  cleanup();
});
