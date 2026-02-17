import type { Location } from "@/entities/location";
import type { Business } from "./types";

/**
 * Ensures a business is linked to a valid City-type location.
 * Prevents businesses from being assigned to top-level Countries.
 *
 * Safe to access business.location directly because BusinessSchema requires it.
 */
export const isBusinessLocationValid = (
  business: Business,
  location: Location | undefined,
): boolean => {
  if (!location) return false;
  return location.type === "city" && location.id === business.location.id;
};
