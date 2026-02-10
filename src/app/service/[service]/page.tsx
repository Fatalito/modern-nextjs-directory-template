import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getDirectoryPaths,
  getPageEntities,
  getServicePageData,
} from "@/app/lib/data-loaders/service-page";
import { pageContent, siteConfig } from "@/shared/config";
import { BusinessDirectoryLayout } from "@/widgets/business-directory-layout";
import { BusinessList, BusinessListFilters } from "@/widgets/business-list";

interface PageProps {
  readonly params: Promise<{ service: string }>;
}

export async function generateStaticParams() {
  return getDirectoryPaths();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { service: serviceSlug } = await params;

  const { service } = await getPageEntities(serviceSlug);

  if (!service) return pageContent.notFound.location;

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
