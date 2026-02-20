import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCityPageData,
  getCityPageDirectoryPaths,
  getCityPageEntities,
} from "@/app/lib/data-loaders/city-page";
import { pageContent, siteConfig } from "@/shared/config";
import { BusinessDirectoryLayout } from "@/widgets/business-directory-layout";
import { BusinessList, BusinessListFilters } from "@/widgets/business-list";

interface PageProps {
  readonly params: Promise<{ country: string; city: string }>;
}

export const revalidate = 3600;
export const dynamicParams = true;

/**
 * Generates static paths for all country/city combinations at build time.
 * @returns Array of param objects for static page generation
 */
export async function generateStaticParams() {
  return getCityPageDirectoryPaths();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { country: countrySlug, city: citySlug } = await params;
  const entities = await getCityPageEntities(countrySlug, citySlug);

  if (!entities?.country || !entities?.city) {
    return pageContent.notFound.location;
  }
  const { country, city } = entities;

  return pageContent.cityPage.metadata(city.name, country.name);
}

export default async function CityPage({ params }: PageProps) {
  const { country: countrySlug, city: citySlug } = await params;
  const data = await getCityPageData(countrySlug, citySlug);

  const entities = data?.entities;
  const country = entities?.country;
  const city = entities?.city;

  if (!data || !country || !city) notFound();

  const { filters, results } = data;

  return (
    <BusinessDirectoryLayout
      title={pageContent.cityPage.pageTitle(city.name, country.name)}
      description={pageContent.cityPage.pageDescription(city.name)}
      author={siteConfig.author}
      license={siteConfig.license}
      filters={
        <BusinessListFilters
          {...filters}
          countrySlug={countrySlug}
          citySlug={citySlug}
        />
      }
    >
      <BusinessList businesses={results} cityName={city.name} />
    </BusinessDirectoryLayout>
  );
}
