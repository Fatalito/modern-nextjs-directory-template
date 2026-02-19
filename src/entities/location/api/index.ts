import { db } from "@/shared/api";
import { createLocationRepository } from "./location-repository";

export const locationRepository = createLocationRepository(db);
