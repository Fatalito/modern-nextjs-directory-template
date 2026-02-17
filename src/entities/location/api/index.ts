import { db } from "@/shared/api/db";
import { createLocationRepository } from "./location-repository";

export const locationRepository = createLocationRepository(db);
