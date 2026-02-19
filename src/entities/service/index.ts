export {
  getAllServices,
  getServiceById,
  getServiceBySlug,
} from "./api/accessors";
export { ServiceRefSchema, ServiceSchema } from "./model/schema";
export type { NewService, Service, ServiceRef } from "./model/types";
