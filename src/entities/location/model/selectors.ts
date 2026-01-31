import type { Location } from "./schema";

/**
 * Returns all top-level countries
 */
export const selectAllCountries = (locations: Location[]) => {
  return locations.filter((l) => l.type === "country" && !l.parentId);
};

/**
 * Returns all cities belonging to a specific country
 */
export const selectCitiesByCountry = (
  locations: Location[],
  countryId: string,
) => {
  return locations.filter((l) => l.type === "city" && l.parentId === countryId);
};

/**
 * Builds a clean SEO path: "france/paris"
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
