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
  getServices,
} from "@/shared/lib";
import { BusinessDirectoryLayout } from "@/widgets/business-directory-layout";
import { BusinessList, BusinessListFilters } from "@/widgets/business-list";

interface PageProps {
  readonly params: Promise<{ country: string; city: string }>;
}

/**
 * Generates static paths for all country/city combinations at build time.
 * @returns Array of param objects for static page generation
 */
export async function generateStaticParams() {
  const locations = getLocations();
  const countries = selectAllCountries(locations);

  const paths: { country: string; city: string }[] = [];

  for (const country of countries) {
    const cities = selectCitiesByCountry(locations, country.id);
    for (const city of cities) {
      paths.push({
        country: country.slug,
        city: city.slug,
      });
    }
  }

  return paths;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { country: countrySlug, city: citySlug } = await params;
  const country = getCountryBySlug(countrySlug);
  const city = country ? getCityBySlug(country.id, citySlug) : undefined;

  if (!city || !country) return pageContent.notFound.location;

  return pageContent.cityPage.metadata(city.name, country.name);
}

export default async function LocationPage({ params }: PageProps) {
  const { country: countrySlug, city: citySlug } = await params;
  const country = getCountryBySlug(countrySlug);
  const city = country ? getCityBySlug(country.id, citySlug) : undefined;

  if (!city || !country) {
    notFound();
  }

  const businesses = getBusinesses();
  const locations = getLocations();
  const services = getServices();
  const filteredBusinesses = selectBusinessesByCriteria(businesses, {
    locationId: city.id,
  });

  return (
    <BusinessDirectoryLayout
      title={pageContent.cityPage.pageTitle(city.name, country.name)}
      description={pageContent.cityPage.pageDescription(city.name)}
      author={siteConfig.author}
      license={siteConfig.license}
      filters={
        <BusinessListFilters
          locations={locations}
          services={services}
          countrySlug={countrySlug}
          citySlug={citySlug}
        />
      }
    >
      <BusinessList businesses={filteredBusinesses} cityName={city.name} />
    </BusinessDirectoryLayout>
  );
}
