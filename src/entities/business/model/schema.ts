import { z } from "zod";
import { ContactSchema } from "@/entities/contact";
import { LocationRefSchema } from "@/entities/location";
import { ServiceRefSchema } from "@/entities/service";
import { UserRefSchema } from "@/entities/user";
import { PublishableEntitySchema, SlugSchema } from "@/shared/lib";

const DIRECTORY_NAME_PATTERN = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;

export const CategoryType = z.enum([
  "retail",
  "services",
  "hospitality",
  "tech",
  "health",
]);

export const BusinessSchema = PublishableEntitySchema.extend({
  managerId: z.uuid(),
  manager: UserRefSchema.optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: SlugSchema,
  description: z.string().max(500).optional(),
  website: z.union([z.literal(""), z.url()]).optional(),

  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),

  email: z.email(),
  contacts: z.array(ContactSchema).min(1),

  directoryName: z
    .string()
    .regex(DIRECTORY_NAME_PATTERN, "Invalid folder name"),

  images: z.array(z.url()).min(1, "At least one image is required"),

  category: CategoryType,
  location: LocationRefSchema,
  serviceIds: z.array(z.uuid()),
  services: z.array(ServiceRefSchema).optional(),
  languages: z.array(z.string().length(2)),
}).describe("businesses");

export type Business = z.infer<typeof BusinessSchema>;
export type CategoryValue = z.infer<typeof CategoryType>;
