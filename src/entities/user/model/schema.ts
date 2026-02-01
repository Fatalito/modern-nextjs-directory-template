import { z } from "zod";

export const UserRole = z.enum(["admin", "agent", "business_owner", "viewer"]);

export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  passwordHash: z.string().min(1),

  role: UserRole.default("business_owner"),
  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
  lastLogin: z.iso.datetime().optional(),
});

export type User = z.infer<typeof UserSchema>;
