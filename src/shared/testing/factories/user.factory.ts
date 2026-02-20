import { createSafeFactory, getBaseDefaults } from "@/shared/lib";
import { type User, UserSchema } from "@/shared/model";

/**
 * Defaults for raw DB factory
 */
const getUserDefaults = () => ({
  ...getBaseDefaults(),
  name: "Test User",
  email: `test-${crypto.randomUUID()}@example.com`,
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
export const createUserRaw = (overrides: Partial<User> = {}): User => ({
  ...getUserDefaults(),
  ...overrides,
});

/**
 * Rich Factory (UI) - Matches UserSchema (usually excludes sensitive data)
 */
const rawUserMock = (overrides: Partial<User> = {}): User =>
  createUserRaw(overrides) as User;

export const createUser = createSafeFactory(UserSchema, rawUserMock);
