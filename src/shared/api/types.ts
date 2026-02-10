import type { Business } from "@/entities/business";
import type { Location } from "@/entities/location";
import type { Service } from "@/entities/service";
import type { User } from "@/entities/user";

/**
 * Interface for the data source.
 * Implementations can be in-memory, file-based, or remote.
 */
export interface IDatabase {
  businesses: Business[];
  locations: Location[];
  services: Service[];
  users: User[];
}
