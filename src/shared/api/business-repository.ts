import type { Business } from "@/entities/business";
import { createSlugRepository, type ISlugRepository } from "./base-repository";
import type { IDatabase } from "./types";

export type IBusinessRepository = ISlugRepository<Business>;

export const createBusinessRepository = (db: IDatabase): IBusinessRepository =>
  createSlugRepository<Business>(db.businesses);
