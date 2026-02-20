import type { Location } from "@/shared/model";

/**
 * Filters locations to return only top-level countries (no parent).
 * @param locations - Array of all location entities
 * @returns Array of country-type locations without parent IDs
 */
export const selectAllCountries = (locations: Location[]) => {
  return locations.filter((l) => l.type === "country" && !l.parentId);
};

/**
 * Filters locations to return cities belonging to a specific country.
 * @param locations - Array of all location entities
 * @param countryId - UUID of the parent country
 * @returns Array of city-type locations with matching parent ID
 */
export const selectCitiesByCountry = (
  locations: Location[],
  countryId: string,
) => {
  return locations.filter((l) => l.type === "city" && l.parentId === countryId);
};

/**
 * Constructs a full location path (country/city) for a given city ID.
 * If the city has a parent country, returns "countrySlug/citySlug".
 * If the city has no parent, returns just the city slug.
 * @param locations - Array of all location entities
 * @param cityId - UUID of the city to find
 * @returns Full location path as a string
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
