import { z } from "zod";
import { slugSchema } from "@/shared/lib/validation/slug";

export const ServiceSchema = z.object({
  id: z.uuid(),
  // For grouping (e.g., 'Plumbing' belongs to 'Home Maintenance')
  parentId: z.uuid().nullable(),

  name: z.string().min(2),
  slug: slugSchema,

  icon: z.string().optional(),

  description: z.string().max(200).optional(),

  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export type Service = z.infer<typeof ServiceSchema>;
