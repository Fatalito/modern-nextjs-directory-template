import { type User, UserSchema } from "@/entities/user";
import { createSafeFactory, getBaseDefaults } from "@/shared/lib";

const rawUserFactory = (overrides: Partial<User>): User => ({
  ...getBaseDefaults(),
  name: "Test User",
  email: "test@example.com",
  role: "business_owner",
  passwordHash: "$2b$10$fake.hashed.password.for.testing.only.xyz123", //NOSONAR
  ...overrides,
});

export const createUser = createSafeFactory(UserSchema, rawUserFactory);
