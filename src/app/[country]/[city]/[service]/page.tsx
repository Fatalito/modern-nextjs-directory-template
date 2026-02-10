import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDirectoryPaths } from "@/app/lib/data-access";
import {
  getLocationServicePageData,
  getLocationServicePageEntities,
} from "@/app/lib/data-loaders/location-service-page";
import { pageContent, siteConfig } from "@/shared/config";
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
  return await getDirectoryPaths();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    country: countrySlug,
    city: citySlug,
    service: serviceSlug,
  } = await params;

  const { country, city, service } = await getLocationServicePageEntities(
    countrySlug,
    citySlug,
    serviceSlug,
  );
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
  const data = await getLocationServicePageData(
    countrySlug,
    citySlug,
    serviceSlug,
  );

  if (!data) {
    notFound();
  }

  const { entities, filters, results } = data;
  const { country, city, service } = entities;

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
          {...filters}
          countrySlug={countrySlug}
          citySlug={citySlug}
          serviceSlug={serviceSlug}
        />
      }
    >
      <BusinessList
        businesses={results}
        cityName={city.name}
        serviceName={service.name}
      />
    </BusinessDirectoryLayout>
  );
}
