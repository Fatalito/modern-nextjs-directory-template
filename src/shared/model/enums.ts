import { z } from "zod";

export const UserRole = z.enum(["admin", "agent", "business_owner", "viewer"]);

export const Category = z.enum([
  "retail",
  "services",
  "hospitality",
  "tech",
  "health",
]);

export const LocationType = z.enum(["country", "city"]);

export type CategoryValue = z.infer<typeof Category>;

export type LocationTypeValue = z.infer<typeof LocationType>;

export type UserRoleType = z.infer<typeof UserRole>;
