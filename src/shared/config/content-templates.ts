/**
 * Content templates for page metadata and UI text.
 * Centralizes all user-facing text to prepare for i18n.
 */
export const pageContent = {
  notFound: {
    location: { title: "Location Not Found" },
    service: { title: "Service Not Found" },
  },
  cityPage: {
    metadata: (city: string, country: string) => ({
      title: `Businesses in ${city}, ${country}`,
      description: `Discover local businesses in ${city}, ${country}`,
    }),
    pageTitle: (city: string, country: string) => `${city}, ${country}`,
    pageDescription: (city: string) => `Discover local businesses in ${city}`,
  },
  servicePage: {
    metadata: (service: string) => ({
      title: `${service} Services`,
      description: `Discover ${service.toLowerCase()} services across all locations`,
    }),
    pageTitle: (service: string) => `${service} Services`,
    pageDescription: (service: string) =>
      `Find ${service.toLowerCase()} services in any location`,
  },
  cityServicePage: {
    metadata: (service: string, city: string, country: string) => ({
      title: `${service} in ${city}, ${country}`,
      description: `Discover ${service.toLowerCase()} services in ${city}, ${country}`,
    }),
    pageTitle: (service: string, city: string, country: string) =>
      `${service} in ${city}, ${country}`,
    pageDescription: (service: string, city: string) =>
      `Browse ${service.toLowerCase()} services in ${city}`,
  },
  businessList: {
    discoveryHeading: (count: number) => `Discovery (${count})`,
    emptyState: {
      cityAndService: (service: string, city: string) =>
        `No ${service} services in ${city} yet!`,
      serviceOnly: (service: string, siteName: string) =>
        `No ${service} services on ${siteName} yet!`,
      cityOnly: (city: string) => `No businesses in ${city} yet!`,
      noFilters: () => "No businesses match your selection.",
    },
  },
} as const;
