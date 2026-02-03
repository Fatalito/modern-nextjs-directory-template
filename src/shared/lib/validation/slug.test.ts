import { describe, expect, it } from "vitest";
import { SlugSchema } from "./slug";

describe("SlugSchema", () => {
  describe("valid slugs", () => {
    it.each([
      ["simple slug", "hello"],
      ["with hyphen", "hello-world"],
      ["with numbers", "product-123"],
      ["all numbers", "123"],
      ["long slug", "this-is-a-very-long-slug-with-many-words"],
      ["min length", "ab"],
    ])("accepts %s: %s", (_, slug) => {
      expect(() => SlugSchema.parse(slug)).not.toThrow();
    });
  });

  describe("invalid slugs", () => {
    it.each([
      ["too short", "a"],
      ["uppercase", "Hello"],
      ["spaces", "hello world"],
      ["underscores", "hello_world"],
      ["special chars", "hello@world"],
      ["trailing hyphen", "hello-"],
      ["leading hyphen", "-hello"],
      ["double hyphen", "hello--world"],
    ])("rejects %s: %s", (_, slug) => {
      expect(() => SlugSchema.parse(slug)).toThrow();
    });
  });
});
