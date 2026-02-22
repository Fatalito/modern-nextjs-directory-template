import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DB_FILE_NAME } from "./constants";

describe("connectionConfig", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(process, "loadEnvFile").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("omits authToken for a local file URL", async () => {
    vi.stubEnv("DATABASE_URL", "file:./sqlite.db");

    const { connectionConfig } = await import("./connection");

    expect(connectionConfig.url).toBe("file:./sqlite.db");
    expect(connectionConfig).not.toHaveProperty("authToken");
  });

  it("includes authToken for a remote libsql URL", async () => {
    vi.stubEnv("DATABASE_URL", "libsql://test-db.aws-eu-west-1.turso.io");
    vi.stubEnv("DATABASE_AUTH_TOKEN", "secret-token");

    const { connectionConfig } = await import("./connection");

    expect(connectionConfig.url).toBe(
      "libsql://test-db.aws-eu-west-1.turso.io",
    );
    expect((connectionConfig as { authToken?: string }).authToken).toBe(
      "secret-token",
    );
  });

  it("falls back to local DB file when DATABASE_URL is unset", async () => {
    const saved = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const { connectionConfig } = await import("./connection");

      expect(connectionConfig.url).toBe(
        `file:${resolve(process.cwd(), DB_FILE_NAME)}`,
      );
      expect(connectionConfig).not.toHaveProperty("authToken");
    } finally {
      if (saved !== undefined) process.env.DATABASE_URL = saved;
    }
  });

  it("warns when .env file is missing and DATABASE_URL is unset", async () => {
    vi.mocked(process.loadEnvFile).mockImplementation(() => {
      throw new Error("ENOENT: .env not found");
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const saved = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      await import("./connection");

      expect(warnSpy).toHaveBeenCalledWith(
        "No .env file found, using local database",
      );
    } finally {
      if (saved !== undefined) process.env.DATABASE_URL = saved;
    }
  });
});
