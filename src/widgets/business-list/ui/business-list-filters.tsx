import Link from "next/link";
import { selectAllCountries, selectCitiesByCountry } from "@/entities/location";
import type { Location, Service } from "@/shared/model";
import { Button } from "@/shared/ui";

interface BusinessListFiltersProps {
  readonly locations: Location[];
  readonly services: Service[];
  readonly countrySlug?: string;
  readonly citySlug?: string;
  readonly serviceSlug?: string;
}

/**
 * BusinessListFilters provides interactive location and service filtering for business listings.
 * Displays country/city selection buttons and service filter chips with active state indicators.
 *
 * @param locations - Array of all available locations (countries and cities)
 * @param services - Array of all available services
 * @param countrySlug - Currently selected country slug (optional)
 * @param citySlug - Currently selected city slug (optional)
 * @param serviceSlug - Currently selected service slug (optional)
 * @returns Filter UI with location and service selection buttons
 */
export function BusinessListFilters({
  locations,
  services,
  countrySlug,
  citySlug,
  serviceSlug,
}: BusinessListFiltersProps) {
  const countries = selectAllCountries(locations);
  const countriesWithCities = countries.map((country) => ({
    ...country,
    cities: selectCitiesByCountry(locations, country.id),
  }));

  const locationBasePath =
    countrySlug && citySlug ? `/${countrySlug}/${citySlug}` : "";
  const isAllLocationsActive = !countrySlug || !citySlug;
  const isAllServicesActive = !serviceSlug;
  const allLocationsUrl = serviceSlug ? `/service/${serviceSlug}` : "/";
  const clearServiceUrl = locationBasePath || "/";

  return (
    <div className="flex flex-col gap-3 md:items-end">
      <div className="flex flex-wrap gap-2">
        <Button
          asChild
          variant={isAllLocationsActive ? "default" : "outline"}
          size="sm"
        >
          <Link
            href={allLocationsUrl}
            aria-current={isAllLocationsActive ? "page" : undefined}
          >
            All Locations
          </Link>
        </Button>
        {countriesWithCities.flatMap((country) =>
          country.cities.map((city) => {
            const isActive =
              countrySlug === country.slug && citySlug === city.slug;
            const baseHref = `/${country.slug}/${city.slug}`;
            const href = serviceSlug ? `${baseHref}/${serviceSlug}` : baseHref;
            return (
              <Button
                key={`${country.slug}-${city.slug}`}
                asChild
                variant={isActive ? "default" : "outline"}
                size="sm"
              >
                <Link href={href} aria-current={isActive ? "page" : undefined}>
                  {isActive ? `✓ ${city.name}` : city.name}
                </Link>
              </Button>
            );
          }),
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          asChild
          variant={isAllServicesActive ? "default" : "outline"}
          size="sm"
        >
          <Link
            href={clearServiceUrl}
            aria-current={isAllServicesActive ? "page" : undefined}
          >
            All Services
          </Link>
        </Button>
        {services.map((service) => {
          const href = locationBasePath
            ? `${locationBasePath}/${service.slug}`
            : `/service/${service.slug}`;
          const isActive = serviceSlug === service.slug;
          return (
            <Button
              key={service.id}
              asChild
              variant={isActive ? "default" : "outline"}
              size="sm"
            >
              <Link href={href} aria-current={isActive ? "page" : undefined}>
                {isActive ? `✓ ${service.name}` : service.name}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
