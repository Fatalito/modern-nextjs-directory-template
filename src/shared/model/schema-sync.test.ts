/**
 * Schema sync tests — verify that each Zod "raw" schema has exactly the same
 * keys as the corresponding Drizzle table columns.
 *
 * A failing test here means a Drizzle migration was added (or a column was
 * removed) without updating the Zod schema, or vice versa.
 */
import { getTableColumns } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { schema } from "@/shared/api";
import { BusinessRawSchema } from "./business.schema";
import { LocationRawSchema } from "./location.schema";
import { ServiceSchema } from "./service.schema";
import { UserSchema } from "./user.schema";

const drizzleKeys = (table: Parameters<typeof getTableColumns>[0]) =>
  Object.keys(getTableColumns(table)).sort();

const zodKeys = (zodObject: { shape: Record<string, unknown> }) =>
  Object.keys(zodObject.shape).sort();

const expectSameKeys = (drizzle: string[], zod: string[], label: string) => {
  const missing = drizzle.filter((k) => !zod.includes(k));
  const extra = zod.filter((k) => !drizzle.includes(k));
  expect(
    missing,
    `${label}: add to Zod schema — ${missing.join(", ")}`,
  ).toHaveLength(0);
  expect(
    extra,
    `${label}: remove from Zod schema — ${extra.join(", ")}`,
  ).toHaveLength(0);
};

describe("Schema sync: Zod raw shapes ↔ Drizzle table columns", () => {
  it("businesses table matches BusinessRawSchema", () => {
    expectSameKeys(
      drizzleKeys(schema.businesses),
      zodKeys(BusinessRawSchema),
      "businesses",
    );
  });

  it("locations table matches LocationRawSchema", () => {
    expectSameKeys(
      drizzleKeys(schema.locations),
      zodKeys(LocationRawSchema),
      "locations",
    );
  });

  it("services table matches ServiceSchema", () => {
    expectSameKeys(
      drizzleKeys(schema.services),
      zodKeys(ServiceSchema),
      "services",
    );
  });

  it("users table matches UserSchema", () => {
    expectSameKeys(drizzleKeys(schema.users), zodKeys(UserSchema), "users");
  });
});
