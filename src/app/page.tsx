import { selectBusinessesByCriteria } from "@/entities/business";
import { pageContent, siteConfig } from "@/shared/config";
import { BusinessDirectoryLayout } from "@/widgets/business-directory-layout";
import { BusinessList, BusinessListFilters } from "@/widgets/business-list";
import {
  getAllBusinesses,
  getAllLocations,
  getAllServices,
} from "./lib/data-access";

/**
 * Home page displaying all businesses with location and service filters.
 * @returns Home page component with full business directory
 */
export default async function Home() {
  const [businesses, locations, services] = await Promise.all([
    getAllBusinesses(),
    getAllLocations(),
    getAllServices(),
  ]);
  const filteredBusinesses = selectBusinessesByCriteria(businesses, {});

  return (
    <BusinessDirectoryLayout
      title={pageContent.homePage.pageTitle}
      description={pageContent.homePage.pageDescription}
      author={siteConfig.author}
      license={siteConfig.license}
      filters={
        <BusinessListFilters locations={locations} services={services} />
      }
    >
      <BusinessList businesses={filteredBusinesses} />
    </BusinessDirectoryLayout>
  );
}
