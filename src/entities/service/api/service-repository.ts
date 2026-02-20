import { createSlugRepository, type DB, schema } from "@/shared/api";
import { ServiceSchema } from "@/shared/model";

export const createServiceRepository = (db: DB) =>
  createSlugRepository(db, schema.services, (r) => ServiceSchema.parse(r));
