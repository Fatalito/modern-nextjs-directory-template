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
import { BaseLocationShape } from "./location.schema";
import { ServiceSchema } from "./service.schema";
import { UserSchema } from "./user.schema";

const drizzleKeys = (table: Parameters<typeof getTableColumns>[0]) =>
  Object.keys(getTableColumns(table)).sort();

const zodKeys = (zodObject: { shape: Record<string, unknown> }) =>
  Object.keys(zodObject.shape).sort();

describe("Schema sync: Zod raw shapes ↔ Drizzle table columns", () => {
  it("businesses table matches BusinessRawSchema", () => {
    expect(drizzleKeys(schema.businesses)).toEqual(zodKeys(BusinessRawSchema));
  });

  it("locations table matches BaseLocationShape", () => {
    expect(drizzleKeys(schema.locations)).toEqual(zodKeys(BaseLocationShape));
  });

  it("services table matches ServiceSchema", () => {
    expect(drizzleKeys(schema.services)).toEqual(zodKeys(ServiceSchema));
  });

  it("users table matches UserSchema", () => {
    expect(drizzleKeys(schema.users)).toEqual(zodKeys(UserSchema));
  });
});
