import type { BusinessRaw, Service } from "@/shared/model";
import { createBusinessRaw } from "./factories/business.factory";
import { createCountryCityRaw } from "./factories/location.factory";
import { createServiceRaw } from "./factories/service.factory";
import { createUserRaw } from "./factories/user.factory";

type BaseBusinessOptions = {
  business?: Partial<BusinessRaw>;
  service?: Partial<Service>;
  // Passing these IDs signals that we should reuse existing context
  userId?: string;
  locationId?: string;
};

/**
 * Creates a standard directory environment as raw DB-ready objects.
 * When userId or locationId are provided, skips creating those entities.
 * The caller is responsible for inserting the returned objects.
 */
export const createBaseBusiness = (options: BaseBusinessOptions = {}) => {
  let user: ReturnType<typeof createUserRaw> | null = null;
  let userId: string;
  if (options.userId) {
    userId = options.userId;
  } else {
    user = createUserRaw();
    userId = user.id;
  }

  let locations: ReturnType<typeof createCountryCityRaw> | null = null;
  let locationId: string;
  if (options.locationId) {
    locationId = options.locationId;
  } else {
    locations = createCountryCityRaw();
    locationId = locations.city.id;
  }

  const service = createServiceRaw(options.service);
  const business = createBusinessRaw({
    managerId: userId,
    locationId,
    ...options.business,
  });

  return { user, locations, userId, locationId, service, business };
};
