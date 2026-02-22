import { describe, expect, it } from "vitest";
import { serverSchema } from "./env";

describe("Env Validation Logic", () => {
  describe("NODE_ENV", () => {
    it("defaults to development", () => {
      const result = serverSchema.parse({});
      expect(result.NODE_ENV).toBe("development");
    });

    it("accepts valid enum values", () => {
      expect(serverSchema.parse({ NODE_ENV: "production" }).NODE_ENV).toBe(
        "production",
      );
      expect(serverSchema.parse({ NODE_ENV: "test" }).NODE_ENV).toBe("test");
    });

    it("rejects invalid environment names", () => {
      expect(() => serverSchema.parse({ NODE_ENV: "staging" })).toThrow();
    });
  });

  describe("NEXT_OUTPUT_MODE", () => {
    it("defaults to serverless", () => {
      const result = serverSchema.parse({});
      expect(result.NEXT_OUTPUT_MODE).toBe("serverless");
    });

    it("accepts standalone and static modes", () => {
      expect(
        serverSchema.parse({ NEXT_OUTPUT_MODE: "standalone" }).NEXT_OUTPUT_MODE,
      ).toBe("standalone");
      expect(
        serverSchema.parse({ NEXT_OUTPUT_MODE: "static" }).NEXT_OUTPUT_MODE,
      ).toBe("static");
    });

    it("rejects unknown output modes", () => {
      expect(() =>
        serverSchema.parse({ NEXT_OUTPUT_MODE: "docker" }),
      ).toThrow();
    });
  });

  describe("ENABLE_HSTS", () => {
    it("defaults to false", () => {
      const result = serverSchema.parse({});
      expect(result.ENABLE_HSTS).toBe(false);
    });

    it("transforms 'true' string to boolean", () => {
      expect(serverSchema.parse({ ENABLE_HSTS: "true" }).ENABLE_HSTS).toBe(
        true,
      );
      expect(serverSchema.parse({ ENABLE_HSTS: "FALSE" }).ENABLE_HSTS).toBe(
        false,
      );
    });
    it("trims whitespace before comparing", () => {
      expect(serverSchema.parse({ ENABLE_HSTS: " true " }).ENABLE_HSTS).toBe(
        true,
      );
    });
  });

  describe("DATABASE_URL", () => {
    it("is optional and absent by default", () => {
      const result = serverSchema.parse({});
      expect(result.DATABASE_URL).toBeUndefined();
    });

    it("accepts a valid URL", () => {
      const url = "libsql://test-db.aws-eu-west-1.turso.io";
      expect(serverSchema.parse({ DATABASE_URL: url }).DATABASE_URL).toBe(url);
    });

    it("rejects a non-URL string", () => {
      expect(() => serverSchema.parse({ DATABASE_URL: "not-a-url" })).toThrow();
    });
  });

  describe("DATABASE_AUTH_TOKEN", () => {
    it("is optional and absent by default", () => {
      const result = serverSchema.parse({});
      expect(result.DATABASE_AUTH_TOKEN).toBeUndefined();
    });

    it("accepts any string value", () => {
      const token = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.test";
      expect(
        serverSchema.parse({ DATABASE_AUTH_TOKEN: token }).DATABASE_AUTH_TOKEN,
      ).toBe(token);
    });
  });
});
