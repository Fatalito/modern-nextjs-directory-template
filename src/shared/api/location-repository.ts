import type { Location } from "@/entities/location";
import { createSlugRepository, type ISlugRepository } from "./base-repository";
import type { IDatabase } from "./types";

export type ILocationRepository = ISlugRepository<Location>;

export const createLocationRepository = (db: IDatabase): ILocationRepository =>
  createSlugRepository<Location>(db.locations);
