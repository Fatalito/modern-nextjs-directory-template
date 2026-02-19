import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { client } from "./client";
import * as schema from "./schema";

const isTest = process.env.NODE_ENV === "test";
const enableLogger = isTest && process.env.DEBUG_SQL === "true";

export const db = drizzle(client, {
  schema,
  logger: {
    logQuery(query, params) {
      if (enableLogger) {
        console.log(`\x1b[36mSQL:\x1b[0m ${query}`);
        if (params.length) console.log(`\x1b[33mParams:\x1b[0m`, params);
      }
    },
  },
});
export type DB = LibSQLDatabase<typeof schema>;
