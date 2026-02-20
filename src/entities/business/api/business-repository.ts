import {
  aliasedTable,
  and,
  eq,
  exists,
  type InferSelectModel,
  type SQL,
} from "drizzle-orm";
import { createSlugRepository, type DB, schema } from "@/shared/api";
import type { Business, CategoryValue } from "@/shared/model";
import { mapToBusiness } from "../model/mapper";

const DEFAULT_POPULAR_PATHS_LIMIT = 500;

type BaseBusiness = InferSelectModel<typeof schema.businesses>;

type BusinessWithRelations = BaseBusiness & {
  location: InferSelectModel<typeof schema.locations>;
  manager: Pick<InferSelectModel<typeof schema.users>, "id" | "name" | "email">;
  businessServices: (InferSelectModel<typeof schema.businessServices> & {
    service: InferSelectModel<typeof schema.services>;
  })[];
};

const WITH_BUSINESS_RELATIONS = {
  location: true,
  manager: { columns: { id: true, name: true, email: true } },
  businessServices: { with: { service: true } },
} as const;

const adapt = ({ businessServices: bs, ...rest }: BusinessWithRelations) =>
  mapToBusiness(rest, {
    services: bs.map((entry) => entry.service),
    serviceIds: bs.map((entry) => entry.serviceId),
    location: rest.location,
    manager: rest.manager,
  });

export const createBusinessRepository = (db: DB) => {
  const base = createSlugRepository(db, schema.businesses);

  return {
    ...base,
    getById: async (id: string): Promise<Business | undefined> => {
      const result = await db.query.businesses.findFirst({
        where: eq(schema.businesses.id, id),
        with: WITH_BUSINESS_RELATIONS,
      });
      return result ? adapt(result) : undefined;
    },

    getAll: async (): Promise<Business[]> => {
      const results = await db.query.businesses.findMany({
        with: WITH_BUSINESS_RELATIONS,
      });
      return results.map(adapt);
    },
    getBySlug: async (slug: string): Promise<Business | undefined> => {
      const result = await db.query.businesses.findFirst({
        where: eq(schema.businesses.slug, slug),
        with: WITH_BUSINESS_RELATIONS,
      });

      if (!result) return undefined;

      return adapt(result);
    },
    filters: async (params: {
      category?: CategoryValue;
      serviceId?: string;
      locationId?: string;
    }): Promise<Business[]> => {
      const filters: SQL[] = [];

      if (params.category) {
        filters.push(eq(schema.businesses.category, params.category));
      }
      if (params.locationId) {
        filters.push(eq(schema.businesses.locationId, params.locationId));
      }
      if (params.serviceId) {
        filters.push(
          exists(
            db
              .select()
              .from(schema.businessServices)
              .where(
                and(
                  eq(schema.businessServices.businessId, schema.businesses.id),
                  eq(schema.businessServices.serviceId, params.serviceId),
                ),
              ),
          ),
        );
      }

      const results = await db.query.businesses.findMany({
        where: filters.length > 0 ? and(...filters) : undefined,
        with: WITH_BUSINESS_RELATIONS,
      });
      return results.map(adapt);
    },
    getPopularPaths: async (limit = DEFAULT_POPULAR_PATHS_LIMIT) => {
      const parentLocations = aliasedTable(schema.locations, "parent");

      return db
        .selectDistinct({
          city: schema.locations.slug,
          country: parentLocations.slug,
          service: schema.services.slug,
        })
        .from(schema.businesses)
        .innerJoin(
          schema.businessServices,
          eq(schema.businesses.id, schema.businessServices.businessId),
        )
        .innerJoin(
          schema.services,
          eq(schema.businessServices.serviceId, schema.services.id),
        )
        .innerJoin(
          schema.locations,
          eq(schema.businesses.locationId, schema.locations.id),
        )
        .innerJoin(
          parentLocations,
          eq(parentLocations.id, schema.locations.parentId),
        )
        .limit(limit);
    },
  };
};
