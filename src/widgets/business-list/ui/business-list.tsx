import type { Business } from "@/entities/business";
import { BusinessCard } from "@/entities/business";
import { pageContent, siteConfig } from "@/shared/config";

interface BusinessListProps {
  readonly businesses: Business[];
  readonly cityName?: string;
  readonly serviceName?: string;
}

/**
 * BusinessList displays a grid of business cards with contextual empty states.
 * Shows business count in header and adapts empty message based on active filters.
 *
 * @param businesses - Array of businesses to display
 * @param cityName - Name of filtered city for contextual messaging (optional)
 * @param serviceName - Name of filtered service for contextual messaging (optional)
 * @returns Business card grid or contextual empty state
 */
export function BusinessList({
  businesses,
  cityName,
  serviceName,
}: BusinessListProps) {
  const getEmptyMessage = () => {
    if (serviceName && cityName) {
      return pageContent.businessList.emptyState.cityAndService(
        serviceName,
        cityName,
      );
    }
    if (serviceName) {
      return pageContent.businessList.emptyState.serviceOnly(
        serviceName,
        siteConfig.name,
      );
    }
    if (cityName) {
      return pageContent.businessList.emptyState.cityOnly(cityName);
    }
    return pageContent.businessList.emptyState.noFilters();
  };
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-balance">
          {pageContent.businessList.discoveryHeading(businesses.length)}
        </h2>
      </header>

      {businesses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {businesses.map((business, index) => (
            <BusinessCard
              key={business.id}
              business={business}
              priority={index < 2}
              fetchPriority={index < 2 ? "high" : "auto"}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl">
          <p className="text-slate-500 text-pretty">{getEmptyMessage()}</p>
        </div>
      )}
    </section>
  );
}
