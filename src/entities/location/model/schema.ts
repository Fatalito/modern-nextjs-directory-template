import { z } from "zod";

export const LocationType = z.enum(["country", "city"]);

export const LocationSchema = z.object({
  id: z.uuid(),
  // For a Country, parentId is null. For a City, it's the Country's UUID.
  parentId: z.uuid().nullable(),
  type: LocationType,

  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),

  isoCode: z.string().length(2).optional(),

  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export type Location = z.infer<typeof LocationSchema>;
