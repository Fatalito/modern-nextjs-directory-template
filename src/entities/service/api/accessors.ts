import { cache } from "react";
import { serviceRepository } from "./index";

export const getAllServices = cache(() => serviceRepository.getAll());

export const getServiceById = cache((id: string) =>
  serviceRepository.getById(id),
);

export const getServiceBySlug = cache((slug: string) =>
  serviceRepository.getBySlug(slug),
);
