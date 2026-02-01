import { parsePhoneNumber } from "awesome-phonenumber";
import type { Contact } from "./schema";
import { TELEGRAM_USERNAME_REGEX } from "./schema";

/**
 * Formats a phone number for UI display with proper international formatting.
 * Example: "12133734253" -> "+1 213-373-4253"
 * Note: Phone numbers are in international format (country code + number) without the + prefix
 */
export const formatPhoneDisplay = (value: string): string => {
  if (!value) return "";

  const phoneNumber = parsePhoneNumber(`+${value}`);

  if (phoneNumber.valid && phoneNumber.number?.international) {
    return phoneNumber.number.international;
  }

  const strippedWhitespace = value.replaceAll(/\s+/g, "");
  return `+${strippedWhitespace}`;
};

/**
 * Formats Telegram username for UI display with @ prefix
 */
export const formatTelegramDisplay = (value: string): string => {
  if (!value) return "";

  const isStoredUsername = TELEGRAM_USERNAME_REGEX.test(value);
  if (isStoredUsername) {
    return `@${value}`;
  }

  return value;
};

/**
 * Formats a contact value into a platform-specific URI
 */
export const getContactUri = (contact: Contact): string => {
  const strippedValue = contact.value.replaceAll(/\s+/g, "");

  switch (contact.channel) {
    case "phone": {
      return `tel:+${strippedValue}`;
    }

    case "whatsapp": {
      return `https://wa.me/${strippedValue}`;
    }

    case "telegram": {
      const isUserName = TELEGRAM_USERNAME_REGEX.test(contact.value);

      if (isUserName) {
        return `https://t.me/${strippedValue}`;
      }

      return `https://t.me/+${strippedValue}`;
    }
  }
};
