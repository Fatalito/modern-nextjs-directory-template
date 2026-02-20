import { z } from "zod";
import { BaseEntitySchema } from "./base-schema";
import { LocationType } from "./enums";
import { SlugSchema } from "./slug";

export const BaseLocationShape = BaseEntitySchema.extend({
  // For a Country, parentId is null. For a City, it's the Country's UUID.
  parentId: z.uuid().nullable(),
  type: LocationType,

  name: z.string().min(2),
  slug: SlugSchema,

  isoCode: z.string().length(2).nullable(),
});

export const LocationRefSchema = BaseLocationShape.pick({
  id: true,
  name: true,
  slug: true,
}).describe("LocationReference");

export const LocationSchema = BaseLocationShape.refine(
  (data) => {
    if (data.type === "country") return data.parentId === null;
    return data.parentId !== null;
  },
  { message: "Countries cannot have a parentId, and cities must have one" },
).describe("locations");

export type Location = z.infer<typeof LocationSchema>;
export type LocationRef = z.infer<typeof LocationRefSchema>;
