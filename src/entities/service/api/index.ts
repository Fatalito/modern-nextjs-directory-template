import { db } from "@/shared/api/db";
import { createServiceRepository } from "./service-repository";

export const serviceRepository = createServiceRepository(db);
