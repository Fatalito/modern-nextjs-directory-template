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
  createMockLocation({
    id: "uk",
    name: "United Kingdom",
    slug: "uk",
    type: "country",
    createdAt: seedDate,
  }),
  createMockLocation({
    id: "london",
    name: "London",
    slug: "london",
    type: "city",
    parentId: "uk",
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
    location: {
      id: "paris",
      name: "Paris",
      slug: "paris",
    },
    serviceIds: ["s1"],
    languages: ["en", "fr"],
    createdAt: seedDate,
    publishedAt: seedDate,
    updatedAt: seedDate,
  }),
  createMockBusiness({
    id: "b2",
    managerId: "agent-1",
    name: "London Design Co",
    slug: "london-design-co",
    directoryName: "london-design-co-01",
    email: "hello@londondesign.co.uk",
    contacts: [{ channel: "phone", locale: "en", value: "+442071234567" }],
    category: "services",
    location: {
      id: "london",
      name: "London",
      slug: "london",
    },
    serviceIds: ["s1"],
    languages: ["en"],
    images: [
      "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=400&h=600&fit=crop",
    ],
    createdAt: seedDate,
    publishedAt: seedDate,
    updatedAt: seedDate,
  }),
  createMockBusiness({
    id: "b3",
    managerId: "agent-1",
    name: "Paris Plumbing Pro",
    slug: "paris-plumbing-pro",
    directoryName: "paris-plumbing-pro-01",
    email: "contact@parisplumbing.fr",
    contacts: [{ channel: "phone", locale: "fr", value: "+33187654321" }],
    category: "services",
    location: {
      id: "paris",
      name: "Paris",
      slug: "paris",
    },
    serviceIds: ["s2"],
    languages: ["fr"],
    images: [
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=600&fit=crop",
    ],
    createdAt: seedDate,
    publishedAt: seedDate,
    updatedAt: seedDate,
  }),
];
