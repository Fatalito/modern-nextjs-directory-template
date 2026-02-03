import { describe, expect, it } from "vitest";
import { UserRole, UserSchema } from "./schema";

const USER_ID = "550e8400-e29b-41d4-a716-446655440000";

const createUser = (
  overrides: Partial<{
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    contacts?: unknown[];
    role?: "admin" | "agent" | "business_owner" | "viewer";
    createdAt?: string;
    lastLogin?: string;
  }>,
) => ({
  id: USER_ID,
  name: "John Doe",
  email: "john@example.com",
  passwordHash: "hashed_password_123",
  ...overrides,
});

describe("UserSchema", () => {
  it("validates a complete user", () => {
    const user = createUser({
      contacts: [],
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
    expect(result.lastLogin).toBeUndefined();
  });

  it.each([
    [
      "invalid UUID",
      createUser({ id: "not-a-uuid", passwordHash: "password" }),
    ],
    [
      "invalid email",
      createUser({ email: "not-an-email", passwordHash: "password" }),
    ],
    [
      "name too short",
      createUser({
        name: "A",
        email: "test@example.com",
        passwordHash: "password",
      }),
    ],
    ["empty password", createUser({ passwordHash: "" })],
  ])("rejects %s", (_, user) => {
    const result = UserSchema.safeParse(user);
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
