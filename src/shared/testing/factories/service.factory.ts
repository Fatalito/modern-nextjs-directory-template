import {
  type NewService,
  type Service,
  ServiceSchema,
} from "@/entities/service";
import { createSafeFactory, getBaseDefaults } from "@/shared/lib";

/**
 * Defaults for raw DB factory - ensures all required fields are populated for Drizzle seeding and integration tests.
 */
const getServiceDefaults = () => ({
  ...getBaseDefaults(),
  name: "Test Service",
  slug: "test-service",
  description: "A sample service for testing purposes.",
  icon: null,
});

/**
 * Raw Factory (Flat) - Use this for seeding and backend tests where you want a simple, flat object that matches the database schema.
 */
export const createServiceRaw = (
  overrides: Partial<NewService> = {},
): NewService => {
  return {
    ...getServiceDefaults(),
    ...overrides,
  };
};

/**
 * Rich Factory (Nested) - Use this for frontend tests and anywhere you want the full nested structure with validation.
 * In the case of Location, the DB and UI types are often very similar
 * because it's a self-referencing table, but we keep the structure consistent.
 */
const rawServiceMock = (overrides: Partial<Service> = {}): Service => {
  const raw = createServiceRaw(overrides as Partial<NewService>);

  return {
    ...raw,
    ...overrides,
  } as Service;
};

export const createService = createSafeFactory(ServiceSchema, rawServiceMock);
