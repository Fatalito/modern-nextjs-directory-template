import { cache } from "react";
import { getAllLocations, getLocationBySlug } from "@/app/lib/data-access";
import { selectAllCountries, selectCitiesByCountry } from "@/entities/location";
import { isLocationChildOf } from "@/entities/location/model/validation";
import { createDirectoryLoader } from "./factory";

/**
 * Fetches and validates the core entities for the City page route.
 * @param countrySlug - The slug of the country.
 * @param citySlug - The slug of the city.
 * @returns An object containing the country and city entities.
 *         Returns undefined if the city is not a child of the country or if any of the entities are not found.
 */
export const getCityPageEntities = cache(
  async (countrySlug: string, citySlug: string) => {
    const [country, city] = await Promise.all([
      getLocationBySlug(countrySlug),
      getLocationBySlug(citySlug),
    ]);

    if (!isLocationChildOf(city, country)) return;

    return { country, city };
  },
);

/**
 * Fetches and aggregates all necessary data for the City page route.
 * @param countrySlug - The slug of the country.
 * @param citySlug - The slug of the city.
 * @returns An object containing the entities, filters, and results for the City page.
 */
export const getCityPageData = (countrySlug: string, citySlug: string) => {
  return createDirectoryLoader(
    () => getCityPageEntities(countrySlug, citySlug),
    ({ city }) => ({ locationId: city?.id }),
  );
};

export const getCityPageDirectoryPaths = async () => {
  const locations = await getAllLocations();
  const countries = selectAllCountries(locations);

  return countries.flatMap((country) => {
    const cities = selectCitiesByCountry(locations, country.id);
    return cities.map((city) => ({
      country: country.slug,
      city: city.slug,
    }));
  });
};
