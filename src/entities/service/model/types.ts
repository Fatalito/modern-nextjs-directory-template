import type { InferSelectModel } from "drizzle-orm";
import type { NewService, schema } from "@/shared/api";
import type { Service, ServiceRef } from "@/shared/model";

/**
 * DATABASE TYPES
 * Derived directly from Drizzle
 */
export type DbService = InferSelectModel<typeof schema.services>;
export type { NewService };

/**
 * DOMAIN / UI TYPES
 * Derived from Zod schemas in @/shared/model
 */
export type { Service, ServiceRef };
