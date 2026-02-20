import { createSafeFactory, getBaseDefaults } from "@/shared/lib";
import { type Service, ServiceSchema } from "@/shared/model";

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
export const createServiceRaw = (overrides: Partial<Service> = {}): Service => {
  return {
    ...getServiceDefaults(),
    ...overrides,
  };
};

/**
 * Rich Factory (Nested) - Use this for frontend tests and anywhere you want the full nested structure with validation.
 */
const rawServiceMock = (overrides: Partial<Service> = {}): Service =>
  createServiceRaw(overrides);

export const createService = createSafeFactory(ServiceSchema, rawServiceMock);
