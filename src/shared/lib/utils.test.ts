import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn (Class Name Merger)", () => {
  it("merges tailwind classes correctly and prioritises the last 'p-4'", () => {
    const result = cn("px-2 py-2", "p-4");
    expect(result).toBe("p-4");
  });

  it("handles conditional classes", () => {
    const result = cn(
      "text-red-500",
      false && "bg-blue-500",
      true && "font-bold",
    );
    expect(result).toBe("text-red-500 font-bold");
  });
});
