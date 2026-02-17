import { describe, expect, it } from "vitest";
import { createUser } from "@/shared/testing";
import { UserRole, UserSchema } from "./schema";

describe("UserSchema", () => {
  it("validates a complete user", () => {
    const user = createUser({
      contacts: [
        {
          channel: "phone",
          locale: "en",
          value: "1234567890",
          label: "Office",
        },
      ],
      role: "admin",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });

    const result = UserSchema.parse(user);
    expect(result).toMatchObject(user);
  });

  it("validates user with minimal fields with defaults", () => {
    const user = createUser({
      name: "Jane Smith",
      email: "jane@example.com",
      passwordHash: "hashed_password_456",
    });

    const result = UserSchema.parse(user);
    expect(result.role).toBe("business_owner");
    expect(result.createdAt).toBeDefined();
    expect(result.lastLogin).toBeNull();
  });

  it.each([
    ["invalid UUID", { id: "not-a-uuid" }],
    ["invalid email", { email: "not-an-email" }],
    ["name too short", { name: "A" }],
    ["empty password", { passwordHash: "" }],
  ])("rejects %s", (_, user) => {
    const invalidUser = {
      ...createUser(),
      ...user,
    };
    const result = UserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });
});

describe("UserRole", () => {
  it("accepts valid roles", () => {
    const roles = ["admin", "agent", "business_owner", "viewer"] as const;
    for (const role of roles) {
      expect(() => UserRole.parse(role)).not.toThrow();
    }
  });

  it("rejects invalid roles", () => {
    for (const role of ["invalid_role", "superuser"]) {
      expect(() => UserRole.parse(role)).toThrow();
    }
  });
});
