import { createRepository, type DB, schema } from "@/shared/api";
import { UserSchema } from "@/shared/model";

export const createUserRepository = (db: DB) =>
  createRepository(db, schema.users, (r) => UserSchema.parse(r));
