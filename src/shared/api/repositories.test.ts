import { describe, expect, it } from "vitest";
import { createBusinessRepository } from "./business-repository";
import { createLocationRepository } from "./location-repository";
import { createServiceRepository } from "./service-repository";
import type { IDatabase } from "./types";
import { createUserRepository } from "./user-repository";

describe("Specific Repositories", () => {
  const mockDb = {
    users: [{ id: "u1", name: "User 1" }],
    businesses: [{ id: "b1", name: "Biz 1", slug: "biz-1" }],
    locations: [{ id: "l1", name: "Loc 1", slug: "loc-1" }],
    services: [{ id: "s1", name: "Ser 1", slug: "ser-1" }],
  } as unknown as IDatabase;

  it("should initialize all repositories with database data", async () => {
    const userRepo = createUserRepository(mockDb);
    const bizRepo = createBusinessRepository(mockDb);
    const locRepo = createLocationRepository(mockDb);
    const serRepo = createServiceRepository(mockDb);

    expect(await userRepo.getAll()).toEqual(mockDb.users);

    const biz = await bizRepo.getBySlug("biz-1");
    expect(biz).toEqual(mockDb.businesses[0]);

    const locs = await locRepo.getAll();
    expect(locs[0].id).toBe("l1");

    const ser = await serRepo.getBySlug("ser-1");
    expect(ser).toEqual(mockDb.services[0]);
  });
});
