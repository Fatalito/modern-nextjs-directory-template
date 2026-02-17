import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import type { users } from "@/shared/api/db/schema";
import type { UserRefSchema, UserRole, UserSchema } from "./schema";

/**
 * DATABASE TYPES
 * Derived directly from Drizzle
 */
export type DbUser = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

/**
 * DOMAIN / UI TYPES
 * Derived from Zod for validation and rich UI interactions.
 */
export type User = z.infer<typeof UserSchema>;
export type UserRef = z.infer<typeof UserRefSchema>;
export type UserRoleType = z.infer<typeof UserRole>;
