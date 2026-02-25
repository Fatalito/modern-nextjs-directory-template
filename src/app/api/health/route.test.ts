import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/shared/api";
import { GET } from "./route";

vi.mock("@/shared/api", () => ({
  db: {
    $client: {
      execute: vi.fn(),
    },
  },
}));

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.mocked(db.$client.execute).mockResolvedValue(undefined as never);
  });

  it("returns 200 with ok status when database is reachable", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", db: "ok" });
    expect(response.headers.get("X-Commit-Sha")).toBe("local");
  });

  it("returns 503 with error details when database is unreachable", async () => {
    vi.mocked(db.$client.execute).mockRejectedValue(
      new Error("Connection refused"),
    );

    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      status: "error",
      db: "error",
      error: "Connection refused",
    });
    expect(response.headers.get("X-Commit-Sha")).toBe("local");
  });

  it("coerces non-Error thrown values to string in the error body", async () => {
    vi.mocked(db.$client.execute).mockRejectedValue("timeout");

    const response = await GET();

    expect((await response.json()).error).toBe("timeout");
  });
});
