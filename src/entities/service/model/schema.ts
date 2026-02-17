import { z } from "zod";
import { BaseEntitySchema, SlugSchema } from "@/shared/lib";

export const ServiceSchema = BaseEntitySchema.extend({
  name: z.string().min(2),
  slug: SlugSchema,

  icon: z.string().nullish(),

  description: z.string().max(200).nullish(),
}).describe("services");

export const ServiceRefSchema = ServiceSchema.pick({
  id: true,
  name: true,
  slug: true,
}).describe("ServiceReference");
