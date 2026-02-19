import type { InferSelectModel } from "drizzle-orm";
import type { NewLocation, schema } from "@/shared/api";
import type { Location, LocationRef } from "@/shared/model";

/**
 * DATABASE TYPES
 * Derived directly from Drizzle
 */
export type DbLocation = InferSelectModel<typeof schema.locations>;
export type { NewLocation };

/**
 * DOMAIN / UI TYPES
 * Derived from Zod schemas in @/shared/model
 */
export type { Location, LocationRef };
