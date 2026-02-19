import type { InferInsertModel } from "drizzle-orm";
import type { z } from "zod";
import type { Category, LocationType, UserRole } from "./constants";
import type * as schema from "./schema";

export type CategoryValue = z.infer<typeof Category>;

export type FilterCriteria = {
  locationId?: string;
  serviceId?: string;
  category?: CategoryValue;
};

export type LocationTypeValue = z.infer<typeof LocationType>;

export type UserRoleType = z.infer<typeof UserRole>;

export type NewBusiness = InferInsertModel<typeof schema.businesses>;
export type NewLocation = InferInsertModel<typeof schema.locations>;
export type NewService = InferInsertModel<typeof schema.services>;
export type NewUser = InferInsertModel<typeof schema.users>;
