import { beforeEach, describe, expect, it } from "vitest";
import { db, schema } from "@/shared/api";
import { createUserRaw } from "@/shared/testing";
import { getAllUsers, getUserById } from "./accessors";

describe("User Accessors", () => {
  let user: ReturnType<typeof createUserRaw>;

  beforeEach(async () => {
    user = createUserRaw({ name: "Test User" });
    await db.insert(schema.users).values(user);
  });

  it("should return all users", async () => {
    const result = await getAllUsers();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Test User");
  });

  it("should return a user by id", async () => {
    const result = await getUserById(user.id);
    expect(result).toBeDefined();
    expect(result?.id).toBe(user.id);
  });

  it("should return undefined for non-existent id", async () => {
    const result = await getUserById("non-existent");
    expect(result).toBeUndefined();
  });
});
