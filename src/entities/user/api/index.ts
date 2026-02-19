import { db } from "@/shared/api";
import { createUserRepository } from "./user-repository";

export const userRepository = createUserRepository(db);
