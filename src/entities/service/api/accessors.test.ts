import { beforeEach, describe, expect, it } from "vitest";
import { db, schema } from "@/shared/api";
import { createServiceRaw } from "@/shared/testing";
import { getAllServices, getServiceById, getServiceBySlug } from "./accessors";

describe("Service Accessors", () => {
  let service: ReturnType<typeof createServiceRaw>;

  beforeEach(async () => {
    service = createServiceRaw({
      name: "Web Design",
      slug: "web-design",
    });

    await db.insert(schema.services).values(service);
  });

  it("should return all services", async () => {
    const result = await getAllServices();
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("web-design");
  });

  it("should return a service by id", async () => {
    const result = await getServiceById(service.id);
    expect(result).toBeDefined();
    expect(result?.id).toBe(service.id);
  });

  it("should return a service by slug", async () => {
    const result = await getServiceBySlug("web-design");
    expect(result).toBeDefined();
    expect(result?.slug).toBe("web-design");
  });

  it("should return undefined for non-existent slug", async () => {
    const result = await getServiceBySlug("non-existent");
    expect(result).toBeUndefined();
  });
});
