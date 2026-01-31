import type { Location } from "../../location/model/schema";
import type { Business } from "./schema";

/**
 * Ensures a business is linked to a valid City-type location.
 * Prevents businesses from being assigned to top-level Countries.
 */
export const isBusinessLocationValid = (
  business: Business,
  location: Location | undefined,
): boolean => {
  if (!location) return false;

  // Logic: Business MUST be in a city
  return location.type === "city" && location.id === business.locationId;
};
