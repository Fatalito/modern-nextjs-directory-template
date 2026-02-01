import type { Contact } from "../model/schema";

/**
 * Transforms a contact object into a clickable URI
 */
export const getContactUri = (contact: Contact) => {
  const cleanValue = contact.value.replaceAll(/\s+/g, "");

  switch (contact.channel) {
    case "whatsapp":
      return `https://wa.me/${cleanValue.replace("+", "")}`;
    case "telegram":
      return `https://t.me/${cleanValue}`;
    default:
      return `tel:${cleanValue}`;
  }
};
