import { cache } from "react";
import type { FilterCriteria } from "@/app/lib/data-loaders/types";
import { businessRepository } from "./index";

/**
 * Fetches a single business by its unique identifier.
 * @param id - The business UUID.
 * @returns The matching business, or undefined if not found.
 */
export const getBusinessById = cache((id: string) =>
  businessRepository.getById(id),
);

/**
 * Fetches a single business by slug, including relations (location, manager, services).
 * @param slug - The URL-friendly business slug.
 * @returns The matching business with relations, or undefined if not found.
 */
export const getBusinessBySlug = cache((slug: string) =>
  businessRepository.getBySlug(slug),
);

/**
 * Filters businesses by optional category, service, and/or location.
 * Returns all businesses when no criteria are provided.
 * @param params - Optional search criteria: category, serviceId, and locationId.
 * @returns An array of businesses matching the criteria.
 */
export const filterBusinesses = cache((params: FilterCriteria = {}) =>
  businessRepository.filters(params),
);

/**
 * Returns distinct city/country/service path combinations that have at least one business.
 * Used at build time for ISR static path generation — not cached.
 * @param limit - Maximum number of paths to return (default: 500).
 * @returns An array of { country, city, service } slug combinations.
 */
export const getPopularPaths = (limit = 500) =>
  businessRepository.getPopularPaths(limit);
