import { describe, expect, it, vi } from "vitest";
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

describe("client initialization", () => {
  it("uses connectionConfig when VITEST is not set", async () => {
    vi.resetModules();

    const mockCreateClient = vi.fn().mockReturnValue({});
    vi.doMock("@libsql/client", () => ({ createClient: mockCreateClient }));
    vi.doMock("./connection", () => ({
      connectionConfig: { url: "file:./test.db" },
    }));

    const saved = process.env.VITEST;
    delete process.env.VITEST;
    try {
      await import("./client");
      expect(mockCreateClient).toHaveBeenCalledWith({ url: "file:./test.db" });
    } finally {
      if (saved !== undefined) process.env.VITEST = saved;
      vi.resetModules();
    }
  });
});
