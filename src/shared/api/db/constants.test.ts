import { describe, expect, it } from "vitest";
import { UserRole } from "./constants";

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
