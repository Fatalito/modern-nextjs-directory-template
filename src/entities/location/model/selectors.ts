import type { Location } from "@/entities/location";

export const selectAllCountries = (locations: Location[]) => {
  return locations.filter((l) => l.type === "country" && !l.parentId);
};

export const selectCitiesByCountry = (
  locations: Location[],
  countryId: string,
) => {
  return locations.filter((l) => l.type === "city" && l.parentId === countryId);
};

/**
 * Builds SEO-friendly path: "france/paris"
 */
export const selectFullLocationPath = (
  locations: Location[],
  cityId: string,
) => {
  const city = locations.find((l) => l.id === cityId);
  if (!city?.parentId) return city?.slug || "";

  const country = locations.find((l) => l.id === city.parentId);
  return country ? `${country.slug}/${city.slug}` : city.slug;
};
