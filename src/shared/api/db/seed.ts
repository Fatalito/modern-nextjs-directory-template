import { fileURLToPath } from "node:url";
import {
  createBusinessRaw,
  createCountryCityRaw,
  createLocationRaw,
  createServiceRaw,
  createUserRaw,
} from "@/shared/testing";
import { db } from "./db";
import * as schema from "./schema";

export async function seed() {
  console.log("🌱 Starting Drizzle Seed...");

  // 1. Users
  const user = createUserRaw({
    name: "Fatalito",
    email: "fatalito@directory.com",
    role: "agent",
  });

  // 2. Locations
  const { country: france, city: paris } = createCountryCityRaw(
    { slug: "france", name: "France" },
    { slug: "paris", name: "Paris" },
  );
  const lyon = createLocationRaw({
    name: "Lyon",
    slug: "lyon",
    type: "city",
    parentId: france.id,
  });
  const { country: uk, city: london } = createCountryCityRaw();

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

  await db.transaction(async (tx) => {
    await tx.insert(schema.users).values(user).onConflictDoNothing();

    await tx
      .insert(schema.locations)
      .values([france, lyon, paris, uk, london])
      .onConflictDoNothing();

    await tx
      .insert(schema.services)
      .values([webDesign, restaurant, plumbing, consulting])
      .onConflictDoNothing();

    await tx
      .insert(schema.businesses)
      .values([techStudio, lilakIt, namasteRestaurant])
      .onConflictDoNothing();

    // 5. Join Table
    await tx
      .insert(schema.businessServices)
      .values([
        { businessId: techStudio.id, serviceId: webDesign.id },
        { businessId: namasteRestaurant.id, serviceId: restaurant.id },
        { businessId: lilakIt.id, serviceId: webDesign.id },
        { businessId: lilakIt.id, serviceId: consulting.id },
      ])
      .onConflictDoNothing();
  });

  console.log("✅ Database synced with seed data!");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await seed();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}
