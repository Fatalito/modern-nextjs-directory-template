import { z } from "zod";
import { ContactSchema } from "@/entities/contact";

export const BusinessSchema = z.object({
  id: z.uuid(),
  managerId: z.uuid(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be URL-friendly"),
  description: z.string().max(500).optional(),
  website: z.union([z.literal(""), z.url()]).optional(),

  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),

  email: z.email(),
  contacts: z.array(ContactSchema).min(1),

  directoryName: z
    .string()
    .regex(/^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/, "Invalid folder name"),

  category: z.enum(["retail", "services", "hospitality", "tech", "health"]),
  locationId: z.uuid(),
  serviceIds: z.array(z.uuid()),
  languages: z.array(z.string().length(2)),

  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
  publishedAt: z.iso.datetime().nullable().default(null),
  updatedAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export type Business = z.infer<typeof BusinessSchema>;
