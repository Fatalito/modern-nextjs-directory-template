import { z } from "zod";

export const ServiceSchema = z.object({
  id: z.uuid(),
  // For grouping (e.g., 'Plumbing' belongs to 'Home Maintenance')
  parentId: z.uuid().nullable(),

  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),

  icon: z.string().optional(),

  description: z.string().max(200).optional(),

  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export type Service = z.infer<typeof ServiceSchema>;
