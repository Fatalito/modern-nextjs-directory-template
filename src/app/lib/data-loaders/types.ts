import type { Business } from "@/entities/business";
import type { Location } from "@/entities/location";
import type { Service } from "@/entities/service";

export type SearchCriteria = {
  locationId?: string;
  serviceId?: string;
};

export interface DirectoryPageData<TEntities> {
  entities: TEntities;
  filters: {
    locations: Location[];
    services: Service[];
  };
  results: Business[];
}
