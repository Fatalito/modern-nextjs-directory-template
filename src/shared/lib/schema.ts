import { z } from "zod";

export const BaseEntitySchema = z
  .object({
    id: z.uuid(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .describe("BaseEntity");

export const PublishableEntitySchema = BaseEntitySchema.extend({
  publishedAt: z.iso.datetime().nullish(),
}).describe("PublishableEntity");
