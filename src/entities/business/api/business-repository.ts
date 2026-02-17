import {
  aliasedTable,
  and,
  eq,
  exists,
  type InferSelectModel,
  type SQL,
} from "drizzle-orm";
import type { DB } from "@/shared/api/db";
import { createSlugRepository } from "@/shared/api/db/base-repository";
import {
  businesses,
  businessServices,
  locations,
  services,
  type users,
} from "@/shared/api/db/schema";
import type { Business, CategoryValue } from "../model/types";

type BaseBusiness = InferSelectModel<typeof businesses>;

type BusinessWithRelations = BaseBusiness & {
  location: InferSelectModel<typeof locations>;
  manager: InferSelectModel<typeof users>;
  businessServices: (InferSelectModel<typeof businessServices> & {
    service: InferSelectModel<typeof services>;
  })[];
};

export const createBusinessRepository = (db: DB) => {
  const base = createSlugRepository<typeof businesses, Business>(
    db,
    businesses,
  );
  const mapToBusiness = ({
    businessServices: bs,
    ...rest
  }: BusinessWithRelations): Business => ({
    ...rest,
    services: bs.map((entry) => entry.service),
    serviceIds: bs.map((entry) => entry.serviceId),
  });

  return {
    ...base,
    getBySlug: async (slug: string): Promise<Business | undefined> => {
      const result = await db.query.businesses.findFirst({
        where: eq(businesses.slug, slug),
        with: {
          location: true,
          businessServices: {
            with: {
              service: true,
            },
          },
          manager: true,
        },
      });

      if (!result) return undefined;

      return mapToBusiness(result);
    },
    filters: async (params: {
      category?: CategoryValue;
      serviceId?: string;
      locationId?: string;
    }): Promise<Business[]> => {
      const filters: SQL[] = [];

      if (params.category) {
        filters.push(eq(businesses.category, params.category));
      }
      if (params.locationId) {
        filters.push(eq(businesses.locationId, params.locationId));
      }
      if (params.serviceId) {
        filters.push(
          exists(
            db
              .select()
              .from(businessServices)
              .where(
                and(
                  eq(businessServices.businessId, businesses.id),
                  eq(businessServices.serviceId, params.serviceId),
                ),
              ),
          ),
        );
      }

      const results = await db.query.businesses.findMany({
        where: filters.length > 0 ? and(...filters) : undefined,
        with: {
          location: true,
          manager: true,
          businessServices: { with: { service: true } },
        },
      });
      return results.map(mapToBusiness);
    },
    getPopularPaths: async (limit = 500) => {
      const parentLocations = aliasedTable(locations, "parent");

      return db
        .selectDistinct({
          city: locations.slug,
          country: parentLocations.slug,
          service: services.slug,
        })
        .from(businesses)
        .innerJoin(
          businessServices,
          eq(businesses.id, businessServices.businessId),
        )
        .innerJoin(services, eq(businessServices.serviceId, services.id))
        .innerJoin(locations, eq(businesses.locationId, locations.id))
        .innerJoin(parentLocations, eq(parentLocations.id, locations.parentId))
        .limit(limit);
    },
  };
};

export type BusinessRepository = ReturnType<typeof createBusinessRepository>;
