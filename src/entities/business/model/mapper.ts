import {
  type Business,
  type BusinessRaw,
  BusinessSchema,
  type LocationRef,
  type ServiceRef,
  type UserRef,
} from "@/shared/model";

type BusinessJoins = {
  serviceIds: string[];
  services?: ServiceRef[] | null;
  location: LocationRef;
  manager?: UserRef | null;
};

export const mapToBusiness = (
  raw: BusinessRaw,
  joins: BusinessJoins,
): Business => BusinessSchema.parse({ ...raw, ...joins });
