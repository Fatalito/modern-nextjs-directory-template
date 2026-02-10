import { type Service, ServiceSchema } from "@/entities/service";
import { createSafeFactory, getBaseDefaults } from "@/shared/lib";

const rawServiceFactory = (overrides: Partial<Service>): Service => ({
  ...getBaseDefaults(),
  parentId: null,
  name: "Test Service",
  slug: "test-service",
  description: "A sample service for testing purposes.",
  ...overrides,
});

export const createService = createSafeFactory(
  ServiceSchema,
  rawServiceFactory,
);
