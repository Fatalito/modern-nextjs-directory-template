import type { Business } from "@/entities/business";
import type { Location } from "@/entities/location";
import type { Service } from "@/entities/service";
import {
  MOCK_BUSINESSES,
  MOCK_LOCATIONS,
  MOCK_SERVICES,
} from "@/shared/lib/mock-data/seed";

export const getBusinesses = (): Business[] => MOCK_BUSINESSES;

export const getLocations = (): Location[] => MOCK_LOCATIONS;

export const getServices = (): Service[] => MOCK_SERVICES;

export const getCountryBySlug = (slug: string): Location | undefined =>
  MOCK_LOCATIONS.find(
    (location) => location.type === "country" && location.slug === slug,
  );

export const getCityBySlug = (
  countryId: string,
  citySlug: string,
): Location | undefined =>
  MOCK_LOCATIONS.find(
    (location) =>
      location.type === "city" &&
      location.parentId === countryId &&
      location.slug === citySlug,
  );

export const getServiceBySlug = (slug: string): Service | undefined =>
  MOCK_SERVICES.find((service) => service.slug === slug);
