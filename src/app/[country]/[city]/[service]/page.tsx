import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getLocationServicePageData,
  getLocationServicePageEntities,
  getPopularLocationServicePaths,
} from "@/app/lib/data-loaders/location-service-page";
import { pageContent, siteConfig } from "@/shared/config";
import { safeGenerateStaticParams } from "@/shared/lib/generate-static-params";
import { BusinessDirectoryLayout } from "@/widgets/business-directory-layout";
import { BusinessList, BusinessListFilters } from "@/widgets/business-list";

interface PageProps {
  readonly params: Promise<{ country: string; city: string; service: string }>;
}

export const dynamicParams = true;

/**
 * Generates static paths for all country/city/service combinations at build time.
 * @returns Array of param objects for static page generation
 */
export async function generateStaticParams() {
  return safeGenerateStaticParams(
    getPopularLocationServicePaths,
    "City - Service Page",
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    country: countrySlug,
    city: citySlug,
    service: serviceSlug,
  } = await params;

  const entities = await getLocationServicePageEntities(
    countrySlug,
    citySlug,
    serviceSlug,
  );
  if (!entities?.country || !entities?.city || !entities?.service)
    return pageContent.notFound.location;
  const { country, city, service } = entities;

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

  const entities = data?.entities;
  const country = entities?.country;
  const city = entities?.city;
  const service = entities?.service;

  if (!data || !country || !city || !service) notFound();

  const { filters, results } = data;

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
