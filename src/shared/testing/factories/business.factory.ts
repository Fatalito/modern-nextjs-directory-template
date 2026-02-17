import { randomUUID } from "node:crypto";
import {
  type Business,
  BusinessSchema,
  type CategoryValue,
} from "@/entities/business";
import type { NewBusiness } from "@/entities/business/model/types";
import { createSafeFactory, getBaseDefaults } from "@/shared/lib";

const MOCK_BUSINESS_IMAGES: Record<CategoryValue, string> = {
  retail:
    "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=800&q=80",
  services:
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
  hospitality:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  health:
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
};

const getMockImage = (category: CategoryValue) =>
  MOCK_BUSINESS_IMAGES[category];

/**
 * Defaults for raw DB factory - ensures all required fields are populated for Drizzle seeding and integration tests.
 */
const getBusinessDefaults = () => ({
  ...getBaseDefaults(),
  name: "Default Business",
  slug: "default-business",
  description: "A professional business listing.",
  website: "https://example.com",
  email: "info@example.com",
  category: "services" as const,
  contacts: [{ channel: "phone" as const, locale: "en", value: "1234567890" }],
  languages: ["en"],
  publishedAt: null,
});

/**
 * Raw Factory (Flat) - Use this for seeding and backend tests where you want a simple, flat object that matches the database schema.
 */
export const createBusinessRaw = (
  overrides: Partial<NewBusiness> = {},
): NewBusiness => {
  const base = getBusinessDefaults();
  const id = overrides.id ?? base.id;

  return {
    ...base,
    id,
    managerId: randomUUID(),
    locationId: randomUUID(),
    directoryName: `folder-${id.slice(0, 8)}`,
    images: [getMockImage(overrides.category ?? "services")],
    ...overrides,
  };
};

/**
 * Rich Factory (Nested) - Use this for frontend tests and anywhere you want the full nested structure with validation.
 * It builds on top of the raw factory and adds nested objects like location and services, which are required by the Business type
 * but not stored directly in the DB.
 */
const rawBusinessMock = (overrides: Partial<Business> = {}): Business => {
  const raw = createBusinessRaw(overrides as Partial<NewBusiness>);

  return {
    ...raw,
    location: {
      id: raw.locationId,
      name: "Test City",
      slug: "test-city",
    },
    serviceIds: [],
    services: [],
    ...overrides,
  } as Business;
};

/**
 * Safe Factory - Validates against BusinessSchema and provides rich nested objects. Ideal for frontend use and anywhere you want to ensure data integrity.
 */
export const createBusiness = createSafeFactory(
  BusinessSchema,
  rawBusinessMock,
);
