import {
  createBusinessRaw,
  createLocationRaw,
  createServiceRaw,
  createUserRaw,
} from "@/shared/testing";
import { db } from "./index";
import * as schema from "./schema";

export async function seed() {
  console.log("🌱 Starting Drizzle Seed...");

  // 1. Users
  const user = createUserRaw({
    name: "Fatalito",
    email: "fatalito@directory.com",
    role: "agent",
  });
  await db.insert(schema.users).values(user).onConflictDoNothing();

  // 2. Locations
  const france = createLocationRaw({
    name: "France",
    slug: "france",
    type: "country",
  });
  const lyon = createLocationRaw({
    name: "Lyon",
    slug: "lyon",
    type: "city",
    parentId: france.id,
  });
  const paris = createLocationRaw({
    name: "Paris",
    slug: "paris",
    type: "city",
    parentId: france.id,
  });
  const uk = createLocationRaw({
    name: "United Kingdom",
    slug: "uk",
    type: "country",
  });
  const london = createLocationRaw({
    name: "London",
    slug: "london",
    type: "city",
    parentId: uk.id,
  });

  await db
    .insert(schema.locations)
    .values([france, lyon, paris, uk, london])
    .onConflictDoNothing();

  // 3. Services
  const webDesign = createServiceRaw({
    name: "Web Design",
    slug: "web-design",
  });
  const restaurant = createServiceRaw({
    name: "Restaurant",
    slug: "restaurant",
  });
  const plumbing = createServiceRaw({
    name: "Plumbing",
    slug: "plumbing",
  });
  const consulting = createServiceRaw({
    name: "Consulting",
    slug: "consulting",
  });

  await db
    .insert(schema.services)
    .values([webDesign, restaurant, plumbing, consulting])
    .onConflictDoNothing();

  // 4. Businesses
  const techStudio = createBusinessRaw({
    name: "My Tech Studio",
    slug: "my-tech-studio",
    managerId: user.id,
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
    locationId: lyon.id,
    languages: ["en", "fr"],
    category: "tech",
  });

  const lilakIt = createBusinessRaw({
    name: "LilakIT ltd",
    slug: "lilakit-ltd",
    managerId: user.id,
    email: "hello@lilakit.co.uk",
    contacts: [{ channel: "phone", locale: "en", value: "447391011401" }],
    category: "services",
    locationId: london.id,
    languages: ["en", "fr"],
    images: [
      "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=400&h=600&fit=crop",
    ],
  });

  const namasteRestaurant = createBusinessRaw({
    name: "Namasté",
    slug: "namaste-restaurant-lyon",
    managerId: user.id,
    email: "contact@namasterestaurant.fr",
    contacts: [{ channel: "phone", locale: "fr", value: "33987403082" }],
    locationId: lyon.id,
    languages: ["fr"],
    category: "hospitality",
  });

  await db
    .insert(schema.businesses)
    .values([techStudio, lilakIt, namasteRestaurant])
    .onConflictDoNothing();

  // 5. Join Table
  await db
    .insert(schema.businessServices)
    .values([
      {
        businessId: techStudio.id,
        serviceId: webDesign.id,
      },
      {
        businessId: namasteRestaurant.id,
        serviceId: restaurant.id,
      },
      {
        businessId: lilakIt.id,
        serviceId: webDesign.id,
      },
      {
        businessId: lilakIt.id,
        serviceId: consulting.id,
      },
    ])
    .onConflictDoNothing();

  console.log("✅ Database synced with seed data!");
}

try {
  await seed();
} catch (error) {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
}
