import { describe, expect, it } from "vitest";
import { siteConfig } from "@/shared/config";
import robots from "./robots";

describe("robots", () => {
  it("allows all crawlers", () => {
    const result = robots();
    expect(result.rules).toEqual({ userAgent: "*", allow: "/" });
  });

  it("points sitemap to the configured site url", () => {
    const result = robots();
    expect(result.sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
  });
});
