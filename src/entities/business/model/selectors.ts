import type { Business, ContactChannel } from "./schema";

/**
 * Find all businesses assigned to a specific user
 */
export const selectManagedBusinesses = (
  businesses: Business[],
  userId: string,
) => {
  return businesses.filter((business) => business.managerId === userId);
};

/**
 * Finds a contact method based on locale and preferred channel.
 * Fallback Strategy:
 * 1. Exact Match (Locale + Channel)
 * 2. Channel Priority (Any locale)
 * 3. Locale Priority (Any channel)
 * 4. Global Fallback (First available)
 */
export const selectBusinessContact = (
  business: Business,
  options: { locale: string; channel?: ContactChannel },
) => {
  const { locale, channel } = options;
  const { contacts } = business;

  // 1. Exact match (Locale + Channel)
  if (channel) {
    const exact = contacts.find(
      (c) => c.locale === locale && c.channel === channel,
    );
    if (exact) return exact;

    // 2. Channel Priority (User wants to chat/call specifically)
    const channelOnly = contacts.find((c) => c.channel === channel);
    if (channelOnly) return channelOnly;
  }

  // 3. Locale Priority (User wants their language specifically)
  const localeOnly = contacts.find((c) => c.locale === locale);
  if (localeOnly) return localeOnly;

  // 4. Global Fallback
  return contacts[0];
};

/**
 * The "Big Filter": Find businesses by both service and location
 */
export const selectBusinessesByCriteria = (
  businesses: Business[],
  filters: { serviceId?: string; locationId?: string },
) => {
  return businesses.filter((b) => {
    const matchesService = filters.serviceId
      ? b.serviceIds.includes(filters.serviceId)
      : true;
    const matchesLocation = filters.locationId
      ? b.locationId === filters.locationId
      : true;

    return matchesService && matchesLocation;
  });
};
