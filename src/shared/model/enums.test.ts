import { describe, expect, it } from "vitest";
import { Category, LocationType, UserRole } from "./enums";

describe("UserRole", () => {
  it("accepts valid roles", () => {
    const roles = UserRole.options;
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

describe("Category", () => {
  it("accepts valid categories", () => {
    const categories = Category.options;
    for (const category of categories) {
      expect(() => Category.parse(category)).not.toThrow();
    }
  });

  it("rejects invalid categories", () => {
    for (const category of ["invalid_category", "food"]) {
      expect(() => Category.parse(category)).toThrow();
    }
  });
});

describe("LocationType", () => {
  it("accepts valid location types", () => {
    const locationTypes = LocationType.options;
    for (const type of locationTypes) {
      expect(() => LocationType.parse(type)).not.toThrow();
    }
  });

  it("rejects invalid location types", () => {
    for (const type of ["village", "continent"]) {
      expect(() => LocationType.parse(type)).toThrow();
    }
  });
});
