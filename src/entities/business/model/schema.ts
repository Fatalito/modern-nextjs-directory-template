import { z } from "zod";
import { ContactSchema } from "@/entities/contact";
import { slugSchema } from "@/shared/lib/validation/slug";

export const BusinessSchema = z.object({
  id: z.uuid(),
  managerId: z.uuid(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: slugSchema,
  description: z.string().max(500).optional(),
  website: z.union([z.literal(""), z.url()]).optional(),

  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),

  email: z.email(),
  contacts: z.array(ContactSchema).min(1),

  directoryName: z
    .string()
    .regex(/^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/, "Invalid folder name"),

  images: z.array(z.url()).min(1, "At least one image is required"),

  category: z.enum(["retail", "services", "hospitality", "tech", "health"]),
  location: z.object({
    id: z.uuid(),
    name: z.string(),
    slug: slugSchema,
  }),
  serviceIds: z.array(z.uuid()),
  languages: z.array(z.string().length(2)),

  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
  publishedAt: z.iso.datetime().nullable().default(null),
  updatedAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export type Business = z.infer<typeof BusinessSchema>;
