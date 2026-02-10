import {
  type Business,
  BusinessSchema,
  type CategoryValue,
} from "@/entities/business";
import { createSafeFactory, getBaseDefaults } from "@/shared/lib";

/**
 * Utilises PublishableEntitySchema for entities that can be live.
 */
const getPublishableDefaults = () => ({
  ...getBaseDefaults(),
  publishedAt: null,
});

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

const rawBusinessFactory = (overrides: Partial<Business>): Business => {
  const base = getPublishableDefaults();
  const id = overrides.id ?? base.id;
  console.log(
    "Creating business with ID:",
    getMockImage(overrides.category ?? "services"),
  );
  return {
    ...base,
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
    images: [getMockImage(overrides.category ?? "services")],
    category: "services",
    location: {
      id: crypto.randomUUID(),
      name: "Test City",
      slug: "test-city",
    },
    serviceIds: [],
    languages: ["en"],
    ...overrides,
  };
};

export const createBusiness = createSafeFactory(
  BusinessSchema,
  rawBusinessFactory,
);
