import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import type { locations } from "@/shared/api/db/schema";
import type { LocationRefSchema, LocationSchema, LocationType } from "./schema";

/**
 * DATABASE TYPES
 * Derived directly from Drizzle
 */
export type DbLocation = InferSelectModel<typeof locations>;
export type NewLocation = InferInsertModel<typeof locations>;

/**
 * DOMAIN / UI TYPES
 * Derived from Zod for validation and rich UI interactions.
 */
export type Location = z.infer<typeof LocationSchema>;
export type LocationRef = z.infer<typeof LocationRefSchema>;
export type LocationTypeValue = z.infer<typeof LocationType>;
