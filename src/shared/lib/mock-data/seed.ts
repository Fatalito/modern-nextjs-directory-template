import type { Business } from "@/entities/business";
import {
  createMockBusiness,
  createMockLocation,
  createMockService,
  createMockUser,
} from "./factories";

const seedDate = new Date("2024-01-01T00:00:00.000Z").toISOString();

export const MOCK_SERVICES = [
  createMockService({
    id: "s1",
    name: "Web Design",
    slug: "web-design",
    createdAt: seedDate,
  }),
  createMockService({
    id: "s2",
    name: "Plumbing",
    slug: "plumbing",
    createdAt: seedDate,
  }),
];

export const MOCK_LOCATIONS = [
  createMockLocation({
    id: "france",
    name: "France",
    slug: "france",
    type: "country",
    createdAt: seedDate,
  }),
  createMockLocation({
    id: "paris",
    name: "Paris",
    slug: "paris",
    type: "city",
    parentId: "france",
    createdAt: seedDate,
  }),
];

export const MOCK_USERS = [
  createMockUser({
    id: "agent-1",
    name: "Agent",
    email: "agent@directory.com",
    role: "agent",
    createdAt: seedDate,
  }),
];

export const MOCK_BUSINESSES: Business[] = [
  createMockBusiness({
    id: "b1",
    managerId: "agent-1",
    name: "My Tech Studio",
    slug: "my-tech-studio",
    directoryName: "my-tech-studio-01",
    email: "contact@mytechstudio.com",
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
    locationId: "paris",
    serviceIds: ["s1"],
    languages: ["en", "fr"],
    createdAt: seedDate,
    publishedAt: seedDate,
    updatedAt: seedDate,
  }),
];
