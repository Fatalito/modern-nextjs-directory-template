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

  it("should return all users from user repository", async () => {
    const userRepo = createUserRepository(mockDb);
    expect(await userRepo.getAll()).toEqual(mockDb.users);
  });

  it("should return a business by slug", async () => {
    const bizRepo = createBusinessRepository(mockDb);
    const biz = await bizRepo.getBySlug("biz-1");
    expect(biz).toEqual(mockDb.businesses[0]);
  });

  it("should return all locations from location repository", async () => {
    const locRepo = createLocationRepository(mockDb);
    const locs = await locRepo.getAll();
    expect(locs).toEqual(mockDb.locations);
  });

  it("should return a service by slug", async () => {
    const serRepo = createServiceRepository(mockDb);
    const ser = await serRepo.getBySlug("ser-1");
    expect(ser).toEqual(mockDb.services[0]);
  });
});
