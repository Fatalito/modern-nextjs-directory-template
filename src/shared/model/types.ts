import type { CategoryValue } from "./enums";

export type FilterCriteria = {
  locationId?: string;
  serviceId?: string;
  category?: CategoryValue;
};
