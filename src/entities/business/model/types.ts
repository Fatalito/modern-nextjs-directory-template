import type { InferSelectModel } from "drizzle-orm";
import type { NewBusiness, schema } from "@/shared/api";
import type { Business } from "@/shared/model";

/**
 * DATABASE TYPES
 * Derived directly from Drizzle
 */
export type DbBusiness = InferSelectModel<typeof schema.businesses>;
export type { NewBusiness };

/**
 * DOMAIN / UI TYPES
 * Derived from Zod schemas in @/shared/model
 */
export type { Business };
