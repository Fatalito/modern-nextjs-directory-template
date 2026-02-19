import type { NewLocation } from "@/shared/api";
import { createSafeFactory, getBaseDefaults } from "@/shared/lib";
import { type Location, LocationSchema } from "@/shared/model";

/**
 * Defaults for raw DB factory - ensures all required fields are populated for Drizzle seeding and integration tests.
 */
const getLocationDefaults = () => ({
  ...getBaseDefaults(),
  name: "Test Location",
  slug: "test-location",
  type: "country" as const,
  parentId: null,
  isoCode: null,
});

/**
 * Raw Factory (Flat) - Use this for seeding and backend tests where you want a simple, flat object that matches the database schema.
 */
export const createLocationRaw = (
  overrides: Partial<NewLocation> = {},
): NewLocation => {
  return {
    ...getLocationDefaults(),
    ...overrides,
  };
};

/**
 * Rich Factory (Nested) - Use this for frontend tests and anywhere you want the full nested structure with validation.
 * In the case of Location, the DB and UI types are often very similar
 * because it's a self-referencing table, but we keep the structure consistent.
 */
const rawLocationMock = (overrides: Partial<Location> = {}): Location =>
  createLocationRaw(overrides as Partial<NewLocation>) as Location;

export const createLocation = createSafeFactory(
  LocationSchema,
  rawLocationMock,
);

/**
 * Composite factory — creates a matched country + city pair.
 * Use when tests need a valid location hierarchy without seeding the DB.
 */
export const createCountryCityRaw = (
  countryOverrides: Partial<NewLocation> = {},
  cityOverrides: Partial<NewLocation> = {},
) => {
  const country = createLocationRaw({
    slug: "uk",
    name: "United Kingdom",
    ...countryOverrides,
  });
  const city = createLocationRaw({
    slug: "london",
    name: "London",
    type: "city",
    parentId: country.id,
    ...cityOverrides,
  });
  return { country, city };
};
