import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getServicePageData,
  getServicePageDirectoryPaths,
  getServicePageEntities,
} from "@/app/lib/data-loaders/service-page";
import { pageContent, siteConfig } from "@/shared/config";
import { BusinessDirectoryLayout } from "@/widgets/business-directory-layout";
import { BusinessList, BusinessListFilters } from "@/widgets/business-list";

interface PageProps {
  readonly params: Promise<{ service: string }>;
}

export const dynamicParams = true;
/**
 * Generates static paths for all service combinations at build time.
 * @returns Array of param objects for static page generation
 */
export async function generateStaticParams() {
  return getServicePageDirectoryPaths();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { service: serviceSlug } = await params;

  const data = await getServicePageEntities(serviceSlug);

  const service = data?.service;
  if (!data || !service) return pageContent.notFound.service;

  return pageContent.servicePage.metadata(service.name);
}

export default async function ServicePage({ params }: PageProps) {
  const { service: serviceSlug } = await params;
  const data = await getServicePageData(serviceSlug);

  if (!data) {
    notFound();
  }

  const { entities, filters, results } = data;
  const { service } = entities;

  return (
    <BusinessDirectoryLayout
      title={pageContent.servicePage.pageTitle(service.name)}
      description={pageContent.servicePage.pageDescription(service.name)}
      author={siteConfig.author}
      license={siteConfig.license}
      filters={<BusinessListFilters {...filters} serviceSlug={serviceSlug} />}
    >
      <BusinessList businesses={results} serviceName={service.name} />
    </BusinessDirectoryLayout>
  );
}
