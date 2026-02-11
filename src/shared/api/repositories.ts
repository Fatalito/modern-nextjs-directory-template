import { createBusinessRepository } from "./business-repository";
import { db } from "./database";
import { createLocationRepository } from "./location-repository";
import { createServiceRepository } from "./service-repository";
import { createUserRepository } from "./user-repository";

export const businessRepository = createBusinessRepository(db);
export const locationRepository = createLocationRepository(db);
export const serviceRepository = createServiceRepository(db);
export const userRepository = createUserRepository(db);
