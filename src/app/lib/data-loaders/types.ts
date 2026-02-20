import type {
  Business,
  CategoryValue,
  Location,
  Service,
} from "@/shared/model";

export interface DirectoryPageData<TEntities> {
  entities: TEntities;
  filters: {
    locations: Location[];
    services: Service[];
    categories: CategoryValue[];
  };
  results: Business[];
}
