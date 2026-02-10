import type { Business, CategoryRef } from "@/entities/business";
import type { Contact } from "@/entities/contact";
import type { Location, LocationRef } from "@/entities/location";
import { deepFreeze } from "@/shared/lib";
import {
  createBusiness,
  createLocation,
  createService,
  createUser,
} from "@/shared/testing";
import type { IDatabase } from "./types";

const toRef = ({ id, name, slug }: Location): LocationRef => ({
  id,
  name,
  slug,
});

type BusinessSeed = {
  name: string;
  slug: string;
  email: string;
  contacts: Contact[];
  category: CategoryRef;
  location: LocationRef;
  serviceIds: string[];
  languages: string[];
  images?: string[];
};

/**
 * Generates the mock database instance.
 * This function encapsulates the "Seed" logic.
 */
export const createInMemoryDatabase = (): IDatabase => {
  const userAgent = createUser({
    name: "Fatalito",
    email: "fatalito@directory.com",
    role: "agent",
  });

  const france = createLocation({
    name: "France",
    slug: "france",
    type: "country",
  });
  const uk = createLocation({
    name: "United Kingdom",
    slug: "uk",
    type: "country",
  });
  const lyon = createLocation({
    name: "Lyon",
    slug: "lyon",
    type: "city",
    parentId: france.id,
  });
  const london = createLocation({
    name: "London",
    slug: "london",
    type: "city",
    parentId: uk.id,
  });

  const createSeedBusiness = (seed: BusinessSeed): Business =>
    createBusiness({
      ...seed,
      managerId: userAgent.id,
      images: seed.images,
      directoryName: `${seed.slug}-01`,
      publishedAt: new Date().toISOString(),
    });

  const serviceWebDesign = createService({
    name: "Web Design",
    slug: "web-design",
  });
  const serviceRestaurant = createService({
    name: "Restaurant",
    slug: "restaurant",
  });

  const businesses: Business[] = [
    createSeedBusiness({
      name: "My Tech Studio",
      slug: "my-tech-studio",
      email: "contact@mytechstudio.com",
      contacts: [
        {
          channel: "whatsapp",
          locale: "en",
          value: "33612345678",
          label: "Global Support",
        },
        { channel: "phone", locale: "fr", value: "33122334455" },
      ],
      category: "tech",
      location: toRef(lyon),
      serviceIds: [serviceWebDesign.id],
      languages: ["en", "fr"],
    }),
    createSeedBusiness({
      name: "London Design Co",
      slug: "london-design-co",
      email: "hello@londondesign.co.uk",
      contacts: [{ channel: "phone", locale: "en", value: "442071234567" }],
      category: "services",
      location: toRef(london),
      serviceIds: [serviceWebDesign.id],
      languages: ["en"],
      images: [
        "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=400&h=600&fit=crop",
      ],
    }),
    createSeedBusiness({
      name: "Namasté",
      slug: "namaste-restaurant-lyon",
      email: "contact@namasterestaurant.fr",
      contacts: [{ channel: "phone", locale: "fr", value: "33987403082" }],
      category: "hospitality",
      location: toRef(lyon),
      serviceIds: [serviceRestaurant.id],
      languages: ["fr"],
    }),
  ];

  return deepFreeze({
    users: [userAgent],
    locations: [france, lyon, uk, london],
    services: [serviceWebDesign, serviceRestaurant],
    businesses,
  });
};

export const db = createInMemoryDatabase();
