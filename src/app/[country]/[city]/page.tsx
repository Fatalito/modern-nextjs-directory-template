import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllLocations } from "@/app/lib/data-access";
import {
  getCityPageData,
  getCityPageEntities,
} from "@/app/lib/data-loaders/city-page";
import { selectAllCountries, selectCitiesByCountry } from "@/entities/location";
import { pageContent, siteConfig } from "@/shared/config";
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
  const locations = await getAllLocations();
  const countries = selectAllCountries(locations);

  return countries.flatMap((country) => {
    const cities = selectCitiesByCountry(locations, country.id);
    return cities.map((city) => ({
      country: country.slug,
      city: city.slug,
    }));
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { country: countrySlug, city: citySlug } = await params;
  const { country, city } = await getCityPageEntities(countrySlug, citySlug);

  if (!city || !country) return pageContent.notFound.location;
  return pageContent.cityPage.metadata(city.name, country.name);
}

export default async function LocationPage({ params }: PageProps) {
  const { country: countrySlug, city: citySlug } = await params;
  const data = await getCityPageData(countrySlug, citySlug);

  if (!data) {
    notFound();
  }
  const { entities, filters, results } = data;
  const { country, city } = entities;

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
