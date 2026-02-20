import { describe, expect, it } from "vitest";
import { client } from "./client";

describe("Database Client Sanity", () => {
  it("should connect to the correct environment-specific database", async () => {
    const result = await client.execute("SELECT 1 as connection_test");
    expect(result.rows[0].connection_test).toBe(1);

    const dbCheck = await client.execute("PRAGMA database_list");
    const dbPath = dbCheck.rows[0].file;

    expect(dbPath).toBeFalsy();
  });
});
