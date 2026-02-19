import { describe, expect, it } from "vitest";
import { jsonColumnConfig } from "./custom-types";

describe("jsonColumn configuration", () => {
  type TestData = { foo: string }[];
  const config = jsonColumnConfig<TestData>();

  it("should stringify data correctly (Serialisation)", () => {
    expect(config.toDriver([{ foo: "bar" }])).toBe('[{"foo":"bar"}]');
  });

  it("should parse valid JSON back to the expected type (Deserialisation)", () => {
    expect(config.fromDriver('[{"foo":"bar"}]')).toEqual([{ foo: "bar" }]);
  });

  it("should error on invalid JSON", () => {
    expect(() => config.fromDriver("invalid-json")).toThrow();
  });
  it("should return 'text' as the data type", () => {
    expect(config.dataType()).toBe("text");
  });
});
