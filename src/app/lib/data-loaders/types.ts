import type { Business, CategoryValue } from "@/entities/business";
import type { Location } from "@/entities/location";
import type { Service } from "@/entities/service";

export type FilterCriteria = {
  locationId?: string;
  serviceId?: string;
  category?: CategoryValue;
};

export interface DirectoryPageData<TEntities> {
  entities: TEntities;
  filters: {
    locations: Location[];
    services: Service[];
    categories: CategoryValue[];
  };
  results: Business[];
}
