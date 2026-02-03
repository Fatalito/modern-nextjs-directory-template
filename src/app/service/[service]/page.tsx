import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { selectBusinessesByCriteria } from "@/entities/business";
import { pageContent, siteConfig } from "@/shared/config";
import {
  getBusinesses,
  getLocations,
  getServiceBySlug,
  getServices,
} from "@/shared/lib";
import { BusinessDirectoryLayout } from "@/widgets/business-directory-layout";
import { BusinessList, BusinessListFilters } from "@/widgets/business-list";

interface PageProps {
  readonly params: Promise<{ service: string }>;
}

/**
 * Generates static paths for all service pages at build time.
 * @returns Array of param objects for static page generation
 */
export async function generateStaticParams() {
  const services = getServices();
  return services.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { service: serviceSlug } = await params;
  const service = getServiceBySlug(serviceSlug);

  if (!service) return pageContent.notFound.service;

  return pageContent.servicePage.metadata(service.name);
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
      title={pageContent.servicePage.pageTitle(service.name)}
      description={pageContent.servicePage.pageDescription(service.name)}
      author={siteConfig.author}
      license={siteConfig.license}
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
