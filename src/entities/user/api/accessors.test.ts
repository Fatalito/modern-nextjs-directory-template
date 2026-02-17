import { beforeEach, describe, expect, it } from "vitest";
import { db, users } from "@/shared/api";
import { createUserRaw } from "@/shared/testing";
import { getAllUsers, getUserById } from "./accessors";

describe("User Accessors", () => {
  const user = createUserRaw({ name: "Test User" });

  beforeEach(() => {
    db.insert(users).values(user).run();
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
