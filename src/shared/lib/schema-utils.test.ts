import { describe, expect, it } from "vitest";
import { getBaseDefaults } from "./schema-utils";

describe("getBaseDefaults", () => {
  it("returns an object with id, createdAt, updatedAt", () => {
    const result = getBaseDefaults();
    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("string");
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
    expect(typeof result.createdAt).toBe("string");
    expect(typeof result.updatedAt).toBe("string");
    expect(result.createdAt).toEqual(result.updatedAt);
    const createdAt = new Date(result.createdAt);
    expect(Number.isNaN(createdAt.getTime())).toBe(false);
  });

  it("returns unique id and increasing timestamps on each call", () => {
    const first = getBaseDefaults();
    const second = getBaseDefaults();
    expect(first.id).not.toEqual(second.id);
    expect(new Date(second.createdAt).getTime()).toBeGreaterThan(
      new Date(first.createdAt).getTime(),
    );
  });
});
