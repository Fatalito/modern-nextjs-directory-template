import { randomUUID } from "node:crypto";

let seedClock = Date.now();

/**
 * Generates default identity fields.
 */
export const getBaseDefaults = () => {
  seedClock += 1000;
  const date = new Date(seedClock).toISOString();
  return {
    id: randomUUID(),
    createdAt: date,
    updatedAt: date,
  };
};
