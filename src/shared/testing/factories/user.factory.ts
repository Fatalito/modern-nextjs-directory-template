import { randomUUID } from "node:crypto";
import { type NewUser, type User, UserSchema } from "@/entities/user";
import { createSafeFactory, getBaseDefaults } from "@/shared/lib";

/**
 * Defaults for raw DB factory
 */
const getUserDefaults = () => ({
  ...getBaseDefaults(),
  name: "Test User",
  email: `test-${randomUUID()}@example.com`,
  role: "business_owner" as const,
  website: "https://example.com",
  passwordHash: "...",
  contacts: [
    {
      channel: "phone" as const,
      locale: "en",
      value: "1234567890",
      label: "Office",
    },
  ],
  lastLogin: null,
});

/**
 * Raw Factory (Flat) - Includes passwordHash for DB seeding
 */
export const createUserRaw = (overrides: Partial<NewUser> = {}): NewUser => ({
  ...getUserDefaults(),
  ...overrides,
});

/**
 * Rich Factory (UI) - Matches UserSchema (usually excludes sensitive data)
 */
const rawUserMock = (overrides: Partial<User> = {}): User => {
  const raw = createUserRaw(overrides as Partial<NewUser>);
  return {
    ...raw,
    ...overrides,
  } as User;
};

export const createUser = createSafeFactory(UserSchema, rawUserMock);
