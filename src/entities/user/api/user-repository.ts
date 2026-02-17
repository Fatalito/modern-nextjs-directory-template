import type { User } from "@/entities/user";
import type { DB } from "@/shared/api/db";
import {
  createRepository,
  type IBaseRepository,
} from "@/shared/api/db/base-repository";
import { users } from "@/shared/api/db/schema";

export type IUserRepository = IBaseRepository<User>;

export const createUserRepository = (db: DB): IUserRepository =>
  createRepository<typeof users, User>(db, users);
