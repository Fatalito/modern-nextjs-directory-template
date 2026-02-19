import { z } from "zod";
import { BaseEntitySchema, SlugSchema } from "@/shared/lib";

export const ServiceSchema = BaseEntitySchema.extend({
  name: z.string().min(2),
  slug: SlugSchema,

  icon: z.string().nullable(),

  description: z.string().max(200).nullable(),
}).describe("services");

export const ServiceRefSchema = ServiceSchema.pick({
  id: true,
  name: true,
  slug: true,
}).describe("ServiceReference");

export type Service = z.infer<typeof ServiceSchema>;
export type ServiceRef = z.infer<typeof ServiceRefSchema>;
