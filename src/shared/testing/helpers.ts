import type { NewBusiness } from "@/entities/business/model/types";
import {
  businesses,
  businessServices,
  db,
  locations,
  services,
  users,
} from "@/shared/api";
import { createBusinessRaw } from "@/shared/testing/factories/business.factory";
import { createLocationRaw } from "@/shared/testing/factories/location.factory";
import { createServiceRaw } from "@/shared/testing/factories/service.factory";
import { createUserRaw } from "@/shared/testing/factories/user.factory";

export const createBaseBusiness = async (
  overrides: Partial<NewBusiness> = {},
) => {
  const user = createUserRaw();
  const location = createLocationRaw();
  const service = createServiceRaw();
  const business = createBusinessRaw({
    managerId: user.id,
    locationId: location.id,
    ...overrides,
  });

  return await db.transaction((tx) => {
    tx.insert(users).values(user).run();
    tx.insert(locations).values(location).run();
    tx.insert(services).values(service).run();
    tx.insert(businesses).values(business).run();
    tx.insert(businessServices)
      .values({
        businessId: business.id,
        serviceId: service.id,
      })
      .run();

    return { user, location, service, business };
  });
};
