import type { Service } from "@/entities/service";
import { createSlugRepository, type ISlugRepository } from "./base-repository";
import type { IDatabase } from "./types";

export type IServiceRepository = ISlugRepository<Service>;

export const createServiceRepository = (db: IDatabase): IServiceRepository =>
  createSlugRepository<Service>(db.services);
