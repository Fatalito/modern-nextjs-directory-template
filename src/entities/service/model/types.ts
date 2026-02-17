import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import type { services } from "@/shared/api/db/schema";
import type { ServiceRefSchema, ServiceSchema } from "./schema";

/**
 * DATABASE TYPES
 * Derived directly from Drizzle
 */
export type DbService = InferSelectModel<typeof services>;
export type NewService = InferInsertModel<typeof services>;

/**
 * DOMAIN / UI TYPES
 * Derived from Zod for validation and rich UI interactions.
 */
export type Service = z.infer<typeof ServiceSchema>;
export type ServiceRef = z.infer<typeof ServiceRefSchema>;
