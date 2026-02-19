import { beforeEach, describe, expect, it } from "vitest";
import { db, schema } from "@/shared/api";
import { createUserRaw } from "@/shared/testing";
import { userRepository } from "./index";

describe("User Repository", () => {
  let user: ReturnType<typeof createUserRaw>;
  beforeEach(async () => {
    user = createUserRaw();
    await db.insert(schema.users).values([user]);
  });

  it("should return all users", async () => {
    const allUsers = await userRepository.getAll();
    expect(allUsers).toEqual([user]);
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
