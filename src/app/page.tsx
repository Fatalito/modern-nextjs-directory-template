import { getBaseDirectoryData } from "@/app/lib/data-loaders/base";
import { selectBusinessesByCriteria } from "@/entities/business";
import { pageContent, siteConfig } from "@/shared/config";
import { BusinessDirectoryLayout } from "@/widgets/business-directory-layout";
import { BusinessList, BusinessListFilters } from "@/widgets/business-list";

/**
 * Home page displaying all businesses with location and service filters.
 * @returns Home page component with full business directory
 */
export default async function Home() {
  const { allBusinesses, filters } = await getBaseDirectoryData();

  const filteredBusinesses = selectBusinessesByCriteria(allBusinesses, {});

  return (
    <BusinessDirectoryLayout
      title={pageContent.homePage.pageTitle}
      description={pageContent.homePage.pageDescription}
      author={siteConfig.author}
      license={siteConfig.license}
      filters={<BusinessListFilters {...filters} />}
    >
      <BusinessList businesses={filteredBusinesses} />
    </BusinessDirectoryLayout>
  );
}
