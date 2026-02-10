import type { User } from "@/entities/user";
import { createRepository, type IBaseRepository } from "./base-repository";
import type { IDatabase } from "./types";

export type IUserRepository = IBaseRepository<User>;

export const createUserRepository = (db: IDatabase): IUserRepository =>
  createRepository<User>(db.users);
