import type { InferSelectModel } from "drizzle-orm";
import type { NewUser, schema } from "@/shared/api";
import type { User, UserRef } from "@/shared/model";

/**
 * DATABASE TYPES
 * Derived directly from Drizzle
 */
export type DbUser = InferSelectModel<typeof schema.users>;
export type { NewUser };

/**
 * DOMAIN / UI TYPES
 * Derived from Zod schemas in @/shared/model
 */
export type { User, UserRef };
