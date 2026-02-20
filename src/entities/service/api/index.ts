import { db } from "@/shared/api";
import { createServiceRepository } from "./service-repository";

export const serviceRepository = createServiceRepository(db);
