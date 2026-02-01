import type { Business } from "@/entities/business";
import type { Location } from "@/entities/location";
import type { Service } from "@/entities/service";
import type { User } from "@/entities/user";

const mockDate = new Date("2024-01-01T00:00:00.000Z").toISOString();

export const createMockService = (overrides: Partial<Service>): Service => ({
  id: crypto.randomUUID(),
  parentId: null,
  name: "Default Service",
  slug: "default-service",
  createdAt: mockDate,
  ...overrides,
});

export const createMockLocation = (overrides: Partial<Location>): Location => ({
  id: crypto.randomUUID(),
  parentId: null,
  type: "country",
  name: "Default Location",
  slug: "default-location",
  createdAt: mockDate,
  ...overrides,
});

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
    contacts: [
      { channel: "phone", locale: "en", value: "1234567890", label: "Office" },
    ],
    category: "services",
    locationId: crypto.randomUUID(),
    serviceIds: [],
    languages: ["en"],
    createdAt: mockDate,
    publishedAt: null,
    updatedAt: mockDate,
    ...overrides,
  };
};

export const createMockUser = (overrides: Partial<User>): User => ({
  id: crypto.randomUUID(),
  name: "Test User",
  email: "test@example.com",
  passwordHash: "$2b$10$fake.hashed.password.for.testing.only.xyz123", // NOSONAR S2068 - Mock test data, not a real credential
  role: "business_owner",
  createdAt: mockDate,
  ...overrides,
});
