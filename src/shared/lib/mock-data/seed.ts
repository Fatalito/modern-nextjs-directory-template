import type { Business } from "@/entities/business";
import {
  createMockBusiness,
  createMockLocation,
  createMockService,
  createMockUser,
} from "./factories";

export const MOCK_SERVICES = [
  createMockService({ id: "s1", name: "Web Design", slug: "web-design" }),
  createMockService({ id: "s2", name: "Plumbing", slug: "plumbing" }),
];

export const MOCK_LOCATIONS = [
  createMockLocation({
    id: "l1",
    name: "France",
    slug: "france",
    type: "country",
  }),
  createMockLocation({
    id: "l2",
    name: "Paris",
    slug: "paris",
    type: "city",
    parentId: "l1",
  }),
];

export const MOCK_USERS = [
  createMockUser({ id: "u2", email: "agent@directory.com", role: "agent" }),
];

export const MOCK_BUSINESSES: Business[] = [
  createMockBusiness({
    id: "b1",
    managerId: "u2", // Managed by Agent Nasser
    name: "Nasser's Tech Studio",
    slug: "nassers-tech-studio",
    directoryName: "nasser-tech-01",
    email: "contact@nasser.dev",
    contacts: [
      {
        channel: "whatsapp",
        locale: "en",
        value: "+33612345678",
        label: "Global Support",
      },
      { channel: "phone", locale: "fr", value: "+33122334455" },
    ],
    category: "tech",
    locationId: "l2", // Paris
    serviceIds: ["s1"],
    languages: ["en", "fr"],
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
];
