import { db } from "@/shared/api/db";
import { createBusinessRepository } from "./business-repository";

export const businessRepository = createBusinessRepository(db);
