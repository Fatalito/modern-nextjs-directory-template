import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { selectBusinessesByCriteria } from "@/entities/business";
import { selectAllCountries, selectCitiesByCountry } from "@/entities/location";
import { pageContent, siteConfig } from "@/shared/config";
import {
  getBusinesses,
  getCityBySlug,
  getCountryBySlug,
  getLocations,
  getServiceBySlug,
  getServices,
} from "@/shared/lib/data";
import { BusinessDirectoryLayout } from "@/widgets/business-directory-layout";
import { BusinessList, BusinessListFilters } from "@/widgets/business-list";

interface PageProps {
  readonly params: Promise<{ country: string; city: string; service: string }>;
}

/**
 * Generates static paths for all country/city/service combinations at build time.
 * @returns Array of param objects for static page generation
 */
export async function generateStaticParams() {
  const locations = getLocations();
  const services = getServices();
  const countries = selectAllCountries(locations);

  const paths: { country: string; city: string; service: string }[] = [];

  for (const country of countries) {
    const cities = selectCitiesByCountry(locations, country.id);
    for (const city of cities) {
      for (const service of services) {
        paths.push({
          country: country.slug,
          city: city.slug,
          service: service.slug,
        });
      }
    }
  }

  return paths;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    country: countrySlug,
    city: citySlug,
    service: serviceSlug,
  } = await params;
  const country = getCountryBySlug(countrySlug);
  const city = country ? getCityBySlug(country.id, citySlug) : undefined;
  const service = getServiceBySlug(serviceSlug);

  if (!country || !city || !service) return pageContent.notFound.location;

  return pageContent.cityServicePage.metadata(
    service.name,
    city.name,
    country.name,
  );
}

export default async function LocationServicePage({ params }: PageProps) {
  const {
    country: countrySlug,
    city: citySlug,
    service: serviceSlug,
  } = await params;
  const country = getCountryBySlug(countrySlug);
  const city = country ? getCityBySlug(country.id, citySlug) : undefined;
  const service = getServiceBySlug(serviceSlug);

  if (!country || !city || !service) {
    notFound();
  }

  const businesses = getBusinesses();
  const locations = getLocations();
  const services = getServices();
  const filteredBusinesses = selectBusinessesByCriteria(businesses, {
    locationId: city.id,
    serviceId: service.id,
  });

  return (
    <BusinessDirectoryLayout
      title={pageContent.cityServicePage.pageTitle(
        service.name,
        city.name,
        country.name,
      )}
      description={pageContent.cityServicePage.pageDescription(
        service.name,
        city.name,
      )}
      author={siteConfig.author}
      license={siteConfig.license}
      filters={
        <BusinessListFilters
          locations={locations}
          services={services}
          countrySlug={countrySlug}
          citySlug={citySlug}
          serviceSlug={serviceSlug}
        />
      }
    >
      <BusinessList
        businesses={filteredBusinesses}
        cityName={city.name}
        serviceName={service.name}
      />
    </BusinessDirectoryLayout>
  );
}
