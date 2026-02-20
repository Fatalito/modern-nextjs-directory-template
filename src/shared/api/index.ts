export {
  createRepository,
  createSlugRepository,
  type IBaseRepository,
  type ISlugRepository,
} from "./db/base-repository";
export { type DB, db } from "./db/db";

import * as schema from "./db/schema";
export { schema };
