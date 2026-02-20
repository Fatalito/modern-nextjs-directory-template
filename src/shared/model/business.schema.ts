import { z } from "zod";
import { PublishableEntitySchema } from "./base-schema";
import { ContactSchema } from "./contact.schema";
import { Category } from "./enums";
import { LocationRefSchema } from "./location.schema";
import { ServiceRefSchema } from "./service.schema";
import { SlugSchema } from "./slug";
import { UserRefSchema } from "./user.schema";

const DIRECTORY_NAME_PATTERN = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;

/**
 * Flat DB shape — mirrors the `businesses` Drizzle table column-for-column.
 * Use for raw inserts/factories and schema sync tests.
 */
export const BusinessRawSchema = PublishableEntitySchema.extend({
  managerId: z.uuid(),
  locationId: z.uuid(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: SlugSchema,
  description: z.string().max(500).nullish(),
  website: z.union([z.literal(""), z.url()]).nullish(),

  metaTitle: z.string().max(60).nullish(),
  metaDescription: z.string().max(160).nullish(),

  email: z.email(),
  contacts: z.array(ContactSchema).min(1),

  directoryName: z
    .string()
    .regex(DIRECTORY_NAME_PATTERN, "Invalid folder name"),

  images: z.array(z.url()).min(1, "At least one image is required"),

  category: Category,
  languages: z.array(z.string().length(2)),
}).describe("businesses");

export type BusinessRaw = z.infer<typeof BusinessRawSchema>;

/**
 * Domain shape — replaces `locationId` with a resolved `location` ref
 * and hydrates `services`/`manager` from joins.
 * Zod strips unknown keys (e.g. `locationId`) when parsing raw DB results.
 */
export const BusinessSchema = BusinessRawSchema.omit({ locationId: true })
  .extend({
    manager: UserRefSchema.nullish(),
    location: LocationRefSchema,
    serviceIds: z.array(z.uuid()),
    services: z.array(ServiceRefSchema).nullish(),
  })
  .describe("businesses");

export type Business = z.infer<typeof BusinessSchema>;
