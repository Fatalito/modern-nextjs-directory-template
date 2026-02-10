import type { Location } from "@/entities/location";
import { LocationSchema } from "@/entities/location/model/schema";
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
