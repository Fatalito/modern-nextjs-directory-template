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
