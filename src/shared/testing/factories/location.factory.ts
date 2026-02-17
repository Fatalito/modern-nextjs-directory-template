import {
  type Location,
  LocationSchema,
  type NewLocation,
} from "@/entities/location";
import { createSafeFactory, getBaseDefaults } from "@/shared/lib";

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
const rawLocationMock = (overrides: Partial<Location> = {}): Location => {
  const raw = createLocationRaw(overrides as Partial<NewLocation>);

  return {
    ...raw,
    ...overrides,
  } as Location;
};

export const createLocation = createSafeFactory(
  LocationSchema,
  rawLocationMock,
);
