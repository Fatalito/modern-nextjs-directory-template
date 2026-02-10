import { z } from "zod";
import { ContactSchema } from "@/entities/contact";
import { BaseEntitySchema } from "@/shared/lib/schema";

export const UserRole = z.enum(["admin", "agent", "business_owner", "viewer"]);

export const UserSchema = BaseEntitySchema.extend({
  name: z.string().min(2),
  email: z.email(),
  passwordHash: z.string().min(1),
  contacts: z.array(ContactSchema).optional(),

  role: UserRole.default("business_owner"),
  lastLogin: z.iso.datetime().optional(),
}).describe("users");

export const UserRefSchema = UserSchema.pick({
  id: true,
  name: true,
}).describe("UserReference");

export type User = z.infer<typeof UserSchema>;
export type UserRef = z.infer<typeof UserRefSchema>;
