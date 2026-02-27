import type { MetadataRoute } from "next";
import { getPopularPaths } from "@/entities/business/server";
import { getCityCountryDirectoryPaths } from "@/entities/location/server";
import { getAllServices } from "@/entities/service/server";
import { siteConfig } from "@/shared/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cityPaths, popularPaths, services] = await Promise.all([
    getCityCountryDirectoryPaths(),
    getPopularPaths(),
    getAllServices(),
  ]);

  const cityEntries: MetadataRoute.Sitemap = cityPaths.map(
    ({ country, city }) => ({
      url: `${siteConfig.url}/${country}/${city}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  const cityServiceEntries: MetadataRoute.Sitemap = popularPaths.map(
    ({ country, city, service }) => ({
      url: `${siteConfig.url}/${country}/${city}/${service}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }),
  );

  const serviceEntries: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${siteConfig.url}/service/${service.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: siteConfig.url, changeFrequency: "daily", priority: 1 },
    ...cityEntries,
    ...cityServiceEntries,
    ...serviceEntries,
  ];
}
