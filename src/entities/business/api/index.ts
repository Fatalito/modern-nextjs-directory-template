import { db } from "@/shared/api";
import { createBusinessRepository } from "./business-repository";

export const businessRepository = createBusinessRepository(db);
