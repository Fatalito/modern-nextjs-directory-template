import { describe, expect, it, vi } from "vitest";
import { safeGenerateStaticParams } from "./generate-static-params";

describe("safeGenerateStaticParams", () => {
  it("returns params from loader on success", async () => {
    const mockParams = [{ slug: "foo" }, { slug: "bar" }];
    const loader = vi.fn().mockResolvedValue(mockParams);
    const result = await safeGenerateStaticParams(loader, "test-page");
    expect(result).toEqual(mockParams);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("returns [] and logs error if loader throws", async () => {
    const error = new Error("fail");
    const loader = vi.fn().mockRejectedValue(error);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const result = await safeGenerateStaticParams(loader, "fail-page");
    expect(result).toEqual([]);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining(
        "[generateStaticParams] Failed to load static paths for fail-page:",
      ),
      error,
    );
    consoleError.mockRestore();
  });
});
