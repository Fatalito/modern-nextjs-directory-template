import type { Service } from "@/entities/service";
import type { DB } from "@/shared/api/db";
import {
  createSlugRepository,
  type ISlugRepository,
} from "@/shared/api/db/base-repository";
import { services } from "@/shared/api/db/schema";

export type IServiceRepository = ISlugRepository<Service>;

export const createServiceRepository = (db: DB): IServiceRepository =>
  createSlugRepository<typeof services, Service>(db, services);
