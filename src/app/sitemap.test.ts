import { describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/shared/config";
import { createServiceRaw } from "@/shared/testing";

vi.mock("@/entities/business/server", () => ({ getPopularPaths: vi.fn() }));
vi.mock("@/entities/location/server", () => ({
  getCityCountryDirectoryPaths: vi.fn(),
}));
vi.mock("@/entities/service/server", () => ({ getAllServices: vi.fn() }));

import { getPopularPaths } from "@/entities/business/server";
import { getCityCountryDirectoryPaths } from "@/entities/location/server";
import { getAllServices } from "@/entities/service/server";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("includes home url with highest priority", async () => {
    vi.mocked(getCityCountryDirectoryPaths).mockResolvedValue([]);
    vi.mocked(getPopularPaths).mockResolvedValue([]);
    vi.mocked(getAllServices).mockResolvedValue([]);

    const result = await sitemap();

    expect(result[0]).toEqual({
      url: siteConfig.url,
      changeFrequency: "daily",
      priority: 1,
    });
  });

  it("returns only home url when no data exists", async () => {
    vi.mocked(getCityCountryDirectoryPaths).mockResolvedValue([]);
    vi.mocked(getPopularPaths).mockResolvedValue([]);
    vi.mocked(getAllServices).mockResolvedValue([]);

    const result = await sitemap();

    expect(result).toHaveLength(1);
  });

  it("includes city urls from getCityCountryDirectoryPaths", async () => {
    vi.mocked(getCityCountryDirectoryPaths).mockResolvedValue([
      { country: "uk", city: "london" },
    ]);
    vi.mocked(getPopularPaths).mockResolvedValue([]);
    vi.mocked(getAllServices).mockResolvedValue([]);

    const result = await sitemap();
    const urls = result.map((e) => e.url);

    expect(urls).toContain(`${siteConfig.url}/uk/london`);
  });

  it("includes city+service urls from getPopularPaths", async () => {
    vi.mocked(getCityCountryDirectoryPaths).mockResolvedValue([]);
    vi.mocked(getPopularPaths).mockResolvedValue([
      { country: "uk", city: "london", service: "plumbing" },
    ]);
    vi.mocked(getAllServices).mockResolvedValue([]);

    const result = await sitemap();
    const urls = result.map((e) => e.url);

    expect(urls).toContain(`${siteConfig.url}/uk/london/plumbing`);
  });

  it("includes service urls from getAllServices", async () => {
    const service = createServiceRaw({ slug: "plumbing" });
    vi.mocked(getCityCountryDirectoryPaths).mockResolvedValue([]);
    vi.mocked(getPopularPaths).mockResolvedValue([]);
    vi.mocked(getAllServices).mockResolvedValue([service]);

    const result = await sitemap();
    const urls = result.map((e) => e.url);

    expect(urls).toContain(`${siteConfig.url}/service/plumbing`);
  });
});
