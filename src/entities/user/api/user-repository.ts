import type { DB } from "@/shared/api";
import { createRepository, schema } from "@/shared/api";

export const createUserRepository = (db: DB) =>
  createRepository(db, schema.users);
