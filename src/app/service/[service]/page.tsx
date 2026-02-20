import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getServicePageData,
  getServicePageDirectoryPaths,
  getServicePageEntities,
} from "@/app/lib/data-loaders/service-page";
import { pageContent, siteConfig } from "@/shared/config";
import { safeGenerateStaticParams } from "@/shared/lib/generate-static-params";
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
  return safeGenerateStaticParams(getServicePageDirectoryPaths, "Service Page");
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { service: serviceSlug } = await params;

  const service = await getServicePageEntities(serviceSlug);

  if (!service) return pageContent.notFound.service;

  return pageContent.servicePage.metadata(service.name);
}

export default async function ServicePage({ params }: PageProps) {
  const { service: serviceSlug } = await params;
  const data = await getServicePageData(serviceSlug);

  if (!data) {
    notFound();
  }

  const { entities: service, filters, results } = data;

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
