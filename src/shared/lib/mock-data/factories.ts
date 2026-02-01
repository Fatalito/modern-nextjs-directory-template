import type { Business } from "@/entities/business";
import type { Location } from "@/entities/location";
import type { Service } from "@/entities/service";
import type { User } from "@/entities/user";

/**
 * Creates a valid Service with defaults
 */
export const createMockService = (overrides: Partial<Service>): Service => ({
  id: crypto.randomUUID(),
  parentId: null,
  name: "Default Service",
  slug: "default-service",
  createdAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Creates a valid Location with defaults
 */
export const createMockLocation = (overrides: Partial<Location>): Location => ({
  id: crypto.randomUUID(),
  parentId: null,
  type: "country",
  name: "Default Location",
  slug: "default-location",
  createdAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Creates a valid Business with defaults that pass Zod validation
 */
export const createMockBusiness = (
  overrides: Partial<Business> = {},
): Business => {
  const id = overrides.id ?? crypto.randomUUID();

  return {
    id,
    managerId: crypto.randomUUID(),
    name: "Default Business",
    slug: "default-business",
    directoryName: `folder-${id.slice(0, 8)}`,
    description: "A professional business listing.",
    website: "https://example.com",
    email: "info@example.com",

    // Default to one phone contact
    contacts: [
      { channel: "phone", locale: "en", value: "+1234567890", label: "Office" },
    ],

    category: "services",
    locationId: crypto.randomUUID(),
    serviceIds: [],
    languages: ["en"],

    createdAt: new Date().toISOString(),
    publishedAt: null,
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Creates a valid User with defaults
 */
export const createMockUser = (overrides: Partial<User>): User => ({
  id: crypto.randomUUID(),
  email: "test@example.com",
  passwordHash: "hashed_password",
  role: "business_owner",
  createdAt: new Date().toISOString(),
  ...overrides,
});
