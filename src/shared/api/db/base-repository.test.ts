import { describe, expect, it } from "vitest";
import { createServiceRaw } from "@/shared/testing";
import { createRepository, createSlugRepository } from "./base-repository";
import { db } from "./db";
import * as schema from "./schema";

describe("createRepository", () => {
  it("returns undefined when the record does not exist", async () => {
    const repo = createRepository(db, schema.services);

    const result = await repo.getById("non-existent-id");

    expect(result).toBeUndefined();
  });

  it("returns the raw row using the default identity parse", async () => {
    const service = createServiceRaw();
    await db.insert(schema.services).values(service);

    const repo = createRepository(db, schema.services);
    const result = await repo.getById(service.id);

    expect(result).toMatchObject({ id: service.id, name: service.name });
  });

  it("maps rows through a custom parse function", async () => {
    const service = createServiceRaw({ slug: "custom-parse-test" });
    await db.insert(schema.services).values(service);

    const repo = createRepository(db, schema.services, (raw) => ({
      id: raw.id,
    }));
    const result = await repo.getById(service.id);

    expect(result).toEqual({ id: service.id });
  });
});

describe("createSlugRepository", () => {
  it("returns undefined when the slug does not exist", async () => {
    const repo = createSlugRepository(db, schema.services);

    const result = await repo.getBySlug("non-existent-slug");

    expect(result).toBeUndefined();
  });

  it("returns the raw row by slug using the default identity parse", async () => {
    const service = createServiceRaw({ slug: "slug-lookup-test" });
    await db.insert(schema.services).values(service);

    const repo = createSlugRepository(db, schema.services);
    const result = await repo.getBySlug("slug-lookup-test");

    expect(result).toMatchObject({ id: service.id, slug: "slug-lookup-test" });
  });
});
