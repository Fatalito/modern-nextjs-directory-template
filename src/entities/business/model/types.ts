import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import type { businesses } from "@/shared/api/db/schema";
import type { BusinessSchema, CategoryType } from "./schema";

/**
 * DATABASE TYPES
 * Derived directly from Drizzle
 */
export type DbBusiness = InferSelectModel<typeof businesses>;
export type NewBusiness = InferInsertModel<typeof businesses>;

/**
 * DOMAIN / UI TYPES
 * Derived from Zod for validation and rich UI interactions.
 */
export type Business = z.infer<typeof BusinessSchema>;
export type CategoryValue = z.infer<typeof CategoryType>;
