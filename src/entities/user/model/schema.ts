import { z } from "zod";
import { ContactSchema } from "@/entities/contact";
import { BaseEntitySchema } from "@/shared/lib";

export const UserRole = z.enum(["admin", "agent", "business_owner", "viewer"]);

export const UserSchema = BaseEntitySchema.extend({
  name: z.string().min(2),
  email: z.email(),
  website: z.url().nullish(),
  passwordHash: z.string().min(1),
  contacts: z.array(ContactSchema).min(1),

  role: UserRole.default("business_owner"),
  lastLogin: z.iso.datetime().nullish(),
}).describe("users");

export const UserRefSchema = UserSchema.pick({
  id: true,
  name: true,
}).describe("UserReference");
