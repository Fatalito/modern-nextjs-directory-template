let seedClock = Date.now();

const ONE_SECOND = 1000;
/**
 * Generates default identity fields.
 */
export const getBaseDefaults = () => {
  seedClock += ONE_SECOND;
  const date = new Date(seedClock).toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: date,
    updatedAt: date,
  };
};
