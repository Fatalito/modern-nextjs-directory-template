import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { selectBusinessesByCriteria } from "@/entities/business";
import {
  getBusinesses,
  getLocations,
  getServiceBySlug,
  getServices,
} from "@/shared/lib/data/mock-repository";
import { BusinessDirectoryLayout } from "@/widgets/business-directory-layout";
import { BusinessList, BusinessListFilters } from "@/widgets/business-list";

interface PageProps {
  params: { service: string };
}

export async function generateStaticParams() {
  const services = getServices();
  return services.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { service: serviceSlug } = await params;
  const service = getServiceBySlug(serviceSlug);

  if (!service) return { title: "Service Not Found" };

  return {
    title: `${service.name} Services`,
    description: `Discover ${service.name.toLowerCase()} services across all locations`,
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { service: serviceSlug } = await params;
  const service = getServiceBySlug(serviceSlug);

  if (!service) {
    notFound();
  }

  const businesses = getBusinesses();
  const locations = getLocations();
  const services = getServices();
  const filteredBusinesses = selectBusinessesByCriteria(businesses, {
    serviceId: service.id,
  });

  return (
    <BusinessDirectoryLayout
      title={`${service.name} Services`}
      description={`Discover ${service.name.toLowerCase()} services across all locations`}
      filters={
        <BusinessListFilters
          locations={locations}
          services={services}
          serviceSlug={serviceSlug}
        />
      }
    >
      <BusinessList
        businesses={filteredBusinesses}
        serviceName={service.name}
      />
    </BusinessDirectoryLayout>
  );
}
