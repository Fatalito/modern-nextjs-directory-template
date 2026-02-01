import { z } from "zod";
import { ContactSchema } from "@/entities/contact";

export const UserRole = z.enum(["admin", "agent", "business_owner", "viewer"]);

export const UserSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2),
  email: z.email(),
  passwordHash: z.string().min(1),
  contacts: z.array(ContactSchema).optional(),

  role: UserRole.default("business_owner"),
  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
  lastLogin: z.iso.datetime().optional(),
});

export type User = z.infer<typeof UserSchema>;
