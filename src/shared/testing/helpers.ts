import type { NewBusiness, NewService } from "@/shared/api";
import { db, schema } from "@/shared/api";
import { createBusinessRaw } from "./factories/business.factory";
import { createCountryCityRaw } from "./factories/location.factory";
import { createServiceRaw } from "./factories/service.factory";
import { createUserRaw } from "./factories/user.factory";

type SeedOverrides = {
  business?: Partial<NewBusiness>;
  service?: Partial<NewService>;
  // Passing these IDs signals that we should reuse existing context
  userId?: string;
  locationId?: string;
};
/**
 * Seeds a standard directory environment.
 * Perfect for integration tests that need a pre-existing user, location, and business.
 */
export const seedBaseBusiness = async (overrides: SeedOverrides = {}) => {
  return await db.transaction(async (tx) => {
    let userId = overrides.userId;
    if (!userId) {
      const user = createUserRaw();
      await tx.insert(schema.users).values(user);
      userId = user.id;
    }

    let locationId = overrides.locationId;
    if (!locationId) {
      const locations = createCountryCityRaw();
      const city = locations.city;
      const country = locations.country;
      await tx.insert(schema.locations).values([country, city]);
      locationId = city.id;
    }

    const service = createServiceRaw(overrides.service);
    await tx.insert(schema.services).values(service);

    const business = createBusinessRaw({
      managerId: userId,
      locationId: locationId,
      ...overrides.business,
    });
    await tx.insert(schema.businesses).values(business);

    await tx.insert(schema.businessServices).values({
      businessId: business.id,
      serviceId: service.id,
    });

    return { userId, locationId, service, business };
  });
};
