import { type Location, LocationSchema } from "@/entities/location";
import { createSafeFactory, getBaseDefaults } from "@/shared/lib";

const rawLocationFactory = (overrides: Partial<Location>): Location => ({
  ...getBaseDefaults(),
  name: "Test Location",
  slug: "test-location",
  type: "country",
  parentId: null,
  ...overrides,
});

export const createLocation = createSafeFactory(
  LocationSchema,
  rawLocationFactory,
);
