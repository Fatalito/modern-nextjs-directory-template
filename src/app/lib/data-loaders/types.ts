import type { Business } from "@/entities/business";
import type { Location } from "@/entities/location";
import type { Service } from "@/entities/service";
import type { CategoryValue } from "@/shared/api";

export interface DirectoryPageData<TEntities> {
  entities: TEntities;
  filters: {
    locations: Location[];
    services: Service[];
    categories: CategoryValue[];
  };
  results: Business[];
}
