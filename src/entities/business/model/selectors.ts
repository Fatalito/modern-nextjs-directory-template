import type { Business, ContactChannel } from "@/shared/model";

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
 * Always returns a Contact because BusinessSchema validates contacts.min(1).
 *
 * Fallback Strategy:
 * 1. Exact Match (Locale + Channel)
 * 2. Channel Priority (Any locale)
 * 3. Locale Priority (Any channel)
 * 4. Guaranteed Fallback (First contact - schema ensures ≥1)
 */
export const selectBusinessContact = (
  business: Business,
  options: { locale: string; channel?: ContactChannel },
) => {
  const { locale, channel } = options;
  const { contacts } = business;

  if (channel) {
    const exactMatch = contacts.find(
      (c) => c.locale === locale && c.channel === channel,
    );
    if (exactMatch) return exactMatch;

    const anyLocaleMatch = contacts.find((c) => c.channel === channel);
    if (anyLocaleMatch) return anyLocaleMatch;
  }

  const anyChannelMatch = contacts.find((c) => c.locale === locale);
  if (anyChannelMatch) return anyChannelMatch;

  // Safe: BusinessSchema.contacts.min(1) guarantees at least one contact
  return contacts[0];
};

/**
 * Check if business matches location filter.
 * Safe to access business.location directly because BusinessSchema requires it.
 */
const matchesLocationFilter = (
  business: Business,
  locationIdFilter?: string,
): boolean => !locationIdFilter || business.location.id === locationIdFilter;

/**
 * Find businesses by both service and location
 */
export const selectBusinessesByCriteria = (
  businesses: Business[],
  filters: { serviceId?: string; locationId?: string },
) => {
  return businesses.filter((business) => {
    const matchesService = filters.serviceId
      ? business.serviceIds.includes(filters.serviceId)
      : true;
    const matchesLocation = matchesLocationFilter(business, filters.locationId);

    return matchesService && matchesLocation;
  });
};
