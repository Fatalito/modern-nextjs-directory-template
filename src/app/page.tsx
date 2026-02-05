import { selectBusinessesByCriteria } from "@/entities/business";
import { pageContent, siteConfig } from "@/shared/config";
import { getBusinesses, getLocations, getServices } from "@/shared/lib/data";
import { BusinessDirectoryLayout } from "@/widgets/business-directory-layout";
import { BusinessList, BusinessListFilters } from "@/widgets/business-list";

/**
 * Home page displaying all businesses with location and service filters.
 * @returns Home page component with full business directory
 */
export default function Home() {
  const businesses = getBusinesses();
  const locations = getLocations();
  const services = getServices();
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
