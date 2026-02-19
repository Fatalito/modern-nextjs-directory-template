import { z } from "zod";
import { UserRole } from "@/shared/api";
import { BaseEntitySchema } from "@/shared/lib";
import { ContactSchema } from "./contact.schema";

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

export type User = z.infer<typeof UserSchema>;
export type UserRef = z.infer<typeof UserRefSchema>;
