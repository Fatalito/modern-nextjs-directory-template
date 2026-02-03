import type { Business, LocationRef } from "@/entities/business";
import type { Contact } from "@/entities/contact";
import {
  createMockBusiness,
  createMockLocation,
  createMockService,
  createMockUser,
} from "./factories";

const seedDate = new Date("2024-01-01T00:00:00.000Z").toISOString();

const AGENT_ID = "a0000000-0000-0000-0000-000000000001";
type BusinessSeed = {
  id: string;
  name: string;
  slug: string;
  email: string;
  contacts: Contact[];
  category: "tech" | "services";
  location: LocationRef;
  serviceIds: string[];
  languages: string[];
  images?: string[];
};

const createSeedBusiness = (seed: BusinessSeed): Business =>
  createMockBusiness({
    ...seed,
    managerId: AGENT_ID,
    directoryName: `${seed.slug}-01`,
    createdAt: seedDate,
    publishedAt: seedDate,
    updatedAt: seedDate,
  });

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
    id: AGENT_ID,
    name: "Agent",
    email: "agent@directory.com",
    role: "agent",
    createdAt: seedDate,
  }),
];

const parisLocation: LocationRef = {
  id: "paris",
  name: "Paris",
  slug: "paris",
};
const londonLocation: LocationRef = {
  id: "london",
  name: "London",
  slug: "london",
};

export const MOCK_BUSINESSES: Business[] = [
  createSeedBusiness({
    id: "b1",
    name: "My Tech Studio",
    slug: "my-tech-studio",
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
    location: parisLocation,
    serviceIds: ["s1"],
    languages: ["en", "fr"],
  }),
  createSeedBusiness({
    id: "b2",
    name: "London Design Co",
    slug: "london-design-co",
    email: "hello@londondesign.co.uk",
    contacts: [{ channel: "phone", locale: "en", value: "+442071234567" }],
    category: "services",
    location: londonLocation,
    serviceIds: ["s1"],
    languages: ["en"],
    images: [
      "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=400&h=600&fit=crop",
    ],
  }),
  createSeedBusiness({
    id: "b3",
    name: "Paris Plumbing Pro",
    slug: "paris-plumbing-pro",
    email: "contact@parisplumbing.fr",
    contacts: [{ channel: "phone", locale: "fr", value: "+33187654321" }],
    category: "services",
    location: parisLocation,
    serviceIds: ["s2"],
    languages: ["fr"],
    images: [
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=600&fit=crop",
    ],
  }),
];
