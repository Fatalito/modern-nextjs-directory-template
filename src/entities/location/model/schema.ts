import { z } from "zod";
import { SlugSchema } from "@/shared/lib";
import { BaseEntitySchema } from "@/shared/lib/schema";

export const LocationType = z.enum(["country", "city"]);
export type LocationTypeValue = z.infer<typeof LocationType>;

export const baseLocationShape = BaseEntitySchema.extend({
  // For a Country, parentId is null. For a City, it's the Country's UUID.
  parentId: z.uuid().nullable(),
  type: LocationType,

  name: z.string().min(2),
  slug: SlugSchema,

  isoCode: z.string().length(2).optional(),
});

export const LocationRefSchema = baseLocationShape
  .pick({
    id: true,
    name: true,
    slug: true,
  })
  .describe("LocationReference");

export const LocationSchema = baseLocationShape
  .refine(
    (data) => {
      if (data.type === "country") return data.parentId === null;
      return true;
    },
    { message: "Countries cannot have a parentId" },
  )
  .describe("locations");

export type Location = z.infer<typeof LocationSchema>;
export type LocationRef = z.infer<typeof LocationRefSchema>;
