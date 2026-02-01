import { z } from "zod";

export const ContactChannel = z.enum(["phone", "whatsapp", "telegram"]);

export const ContactSchema = z.object({
  channel: ContactChannel.default("phone"),
  locale: z.string().length(2), // e.g., 'en', 'fr'
  value: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid E.164 phone number"), // The phone number or username
  label: z.string().optional(), // e.g., 'Customer Support'
});

export const BusinessSchema = z.object({
  id: z.uuid(),
  managerId: z.uuid(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be URL-friendly"),
  description: z.string().max(500).optional(),
  website: z.url().optional().or(z.literal("")),

  // SEO
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),

  // Contact Info
  email: z.email(),
  contacts: z.array(ContactSchema).min(1),

  // Assets
  directoryName: z
    .string()
    .regex(/^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/, "Invalid folder name"),

  category: z.enum(["retail", "services", "hospitality", "tech", "health"]),
  locationId: z.uuid(), // Defined Locations (One)
  serviceIds: z.array(z.uuid()), // Service List (Many)
  languages: z.array(z.string().length(2)), // ISO 639-1 (Many)

  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
  publishedAt: z.iso.datetime().nullable().default(null),
  updatedAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export type Business = z.infer<typeof BusinessSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type ContactChannel = z.infer<typeof ContactChannel>;
