import type { Business } from "@/entities/business";
import { BusinessCard } from "@/entities/business";
import { siteConfig } from "@/shared/config";

interface BusinessListProps {
  readonly businesses: Business[];
  readonly cityName?: string;
  readonly serviceName?: string;
}

export function BusinessList({
  businesses,
  cityName,
  serviceName,
}: BusinessListProps) {
  const getEmptyMessage = () => {
    if (serviceName && cityName) {
      return `No ${serviceName} services in ${cityName} yet!`;
    }
    if (serviceName) {
      return `No ${serviceName} services on ${siteConfig.name} yet!`;
    }
    if (cityName) {
      return `No businesses in ${cityName} yet!`;
    }
    return "No businesses match your selection.";
  };
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-balance">
          Discovery ({businesses.length})
        </h2>
      </header>

      {businesses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {businesses.map((business, index) => (
            <BusinessCard
              key={business.id}
              business={business}
              priority={index === 0}
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
