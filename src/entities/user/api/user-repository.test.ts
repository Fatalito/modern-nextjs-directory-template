import { beforeEach, describe, expect, it } from "vitest";
import { db, users } from "@/shared/api";
import { createUserRaw } from "@/shared/testing";
import { userRepository } from "./index";

describe("User Repository", async () => {
  const user = await createUserRaw({ name: "test-user" });

  beforeEach(async () => {
    await db.insert(users).values([user]);
  });

  it("should return all users", async () => {
    const users = await userRepository.getAll();
    expect(users).toEqual([user]);
  });

  it("should return a user by id", async () => {
    const userById = await userRepository.getById(user.id);
    expect(userById).toEqual(user);
  });

  it("should return undefined for a non-existent id", async () => {
    const userById = await userRepository.getById("non-existent-id");
    expect(userById).toBeUndefined();
  });
});
