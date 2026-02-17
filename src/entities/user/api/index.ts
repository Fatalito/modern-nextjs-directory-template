import { db } from "@/shared/api/db";
import { createUserRepository } from "./user-repository";

export const userRepository = createUserRepository(db);
