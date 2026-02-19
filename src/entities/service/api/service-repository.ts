import type { DB } from "@/shared/api";
import { createSlugRepository, schema } from "@/shared/api";

export const createServiceRepository = (db: DB) =>
  createSlugRepository(db, schema.services);
