import { z } from "zod";

/**
 * Phone numbers: stored in international format, WITHOUT + prefix
 * Format: [1-9]\d{1,14} (E.164 without the + prefix)
 */
const PHONE_NUMBER_REGEX = /^[1-9]\d{1,14}$/;

/**
 * Telegram usernames: 5-32 characters, alphanumeric + underscores, WITHOUT @ prefix
 * Must start with letter, end with letter/digit, no consecutive underscores
 * Note: Accepts any case but normalizes to lowercase (Telegram usernames are case-insensitive)
 */
export const TELEGRAM_USERNAME_REGEX =
  /^(?=.{5,32}$)(?!.*__)(?!^_)[a-zA-Z][a-zA-Z0-9_]{3,31}[a-zA-Z0-9]$/; // NOSONAR -- regex complexity is acceptable here

const phoneValidation = z
  .string()
  .regex(PHONE_NUMBER_REGEX, "Invalid phone format");

const telegramUsernameValidation = z
  .string()
  .regex(TELEGRAM_USERNAME_REGEX, "Invalid Telegram handle")
  .transform((val) => val.toLowerCase());

const baseContactSchema = z.object({
  locale: z.string().length(2),
  label: z.string().optional(),
});

const createPhoneChannelSchema = (channel: "phone" | "whatsapp") =>
  baseContactSchema.extend({
    channel: z.literal(channel),
    value: phoneValidation,
  });

export const ContactChannels = z.enum(["phone", "whatsapp", "telegram"]);

export const ContactSchema = z.discriminatedUnion("channel", [
  createPhoneChannelSchema("phone"),
  createPhoneChannelSchema("whatsapp"),
  baseContactSchema.extend({
    channel: z.literal("telegram"),
    value: phoneValidation.or(telegramUsernameValidation),
  }),
]);

export type Contact = z.infer<typeof ContactSchema>;
export type ContactChannel = z.infer<typeof ContactChannels>;
