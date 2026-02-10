let seedClock = Date.now();

/**
 * Utilises BaseEntitySchema to generate default identity fields.
 */
export const getBaseDefaults = () => {
  seedClock += 1000;
  const date = new Date(seedClock).toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: date,
    updatedAt: date,
  };
};
