import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { schema } from "@/shared/api";
import { db } from "./db";

describe("db", () => {
  describe("instance", () => {
    it("exposes CRUD query builder methods", () => {
      expect(typeof db.select).toBe("function");
      expect(typeof db.insert).toBe("function");
      expect(typeof db.update).toBe("function");
      expect(typeof db.delete).toBe("function");
    });

    it("exposes the relational query API for every schema table", () => {
      expect(db.query.users).toBeDefined();
      expect(db.query.locations).toBeDefined();
      expect(db.query.services).toBeDefined();
      expect(db.query.businesses).toBeDefined();
      expect(db.query.businessServices).toBeDefined();
    });

    it("connects to the in-memory test database and can execute queries", async () => {
      await expect(db.select().from(schema.users)).resolves.toEqual([]);
    });
  });

  describe("logger", () => {
    let consoleSpy!: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("does not log queries when DEBUG_SQL is not set", async () => {
      await db.select().from(schema.users);
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("logs the SQL statement when DEBUG_SQL is true", async () => {
      const original = process.env.DEBUG_SQL;
      process.env.DEBUG_SQL = "true";
      vi.resetModules();
      try {
        const { db: freshDb } = await import("./db");
        await freshDb.select().from(schema.users);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("SQL:"),
        );
      } finally {
        process.env.DEBUG_SQL = original;
        vi.resetModules();
      }
    });

    it("logs query params when DEBUG_SQL is true and the query has bound parameters", async () => {
      const original = process.env.DEBUG_SQL;
      process.env.DEBUG_SQL = "true";
      vi.resetModules();
      try {
        const { db: freshDb } = await import("./db");
        await freshDb
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, "test-id"));
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("Params:"),
          expect.any(Array),
        );
      } finally {
        process.env.DEBUG_SQL = original;
        vi.resetModules();
      }
    });
  });
});
