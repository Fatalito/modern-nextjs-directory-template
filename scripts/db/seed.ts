import { fileURLToPath } from "node:url";
import { count as drizzleCount, sql } from "drizzle-orm";
import { db } from "@/shared/api/db/db";
import * as schema from "@/shared/api/db/schema";
import {
  createBusinessRaw,
  createCountryCityRaw,
  createLocationRaw,
  createServiceRaw,
  createUserRaw,
} from "@/shared/testing";

export async function seed({ force = false }: { force?: boolean } = {}) {
  console.log("🌱 Starting Drizzle Seed...");

  // Guard against accidentally wiping a populated local DB
  if (!force) {
    const [result] = await db
      .select({ total: drizzleCount() })
      .from(schema.users);
    const userCount = result.total;
    if (userCount > 0 && process.stdin.isTTY) {
      const { createInterface } = await import("node:readline");
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const answer = await new Promise<string>((resolve) =>
        rl.question(
          `  Found ${userCount} existing user(s). Overwrite all data? (y/N): `,
          resolve,
        ),
      );
      rl.close();
      if (answer.toLowerCase() !== "y") {
        console.log("  Seed cancelled.");
        return;
      }
    }
  }

  const user = createUserRaw({
    name: "Fatalito",
    email: "fatalito@directory.com",
    role: "agent",
  });

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

  // Disable FK checks so we can wipe tables without worrying about order
  // (locations has a self-referential parentId FK that blocks ordered deletes).
  // PRAGMA must be set outside a transaction; the deletes are wrapped in one
  // for atomicity so a partial wipe is never left in place.
  await db.run(sql`PRAGMA foreign_keys = OFF`);
  await db.transaction(async (tx) => {
    await tx.delete(schema.businessServices);
    await tx.delete(schema.businesses);
    await tx.delete(schema.services);
    await tx.delete(schema.users);
    await tx.delete(schema.locations);
  });
  await db.run(sql`PRAGMA foreign_keys = ON`);

  await db.transaction(async (tx) => {
    await tx.insert(schema.users).values(user);

    await tx.insert(schema.locations).values([france, lyon, paris, uk, london]);

    await tx
      .insert(schema.services)
      .values([webDesign, restaurant, plumbing, consulting]);

    await tx
      .insert(schema.businesses)
      .values([techStudio, lilakIt, namasteRestaurant]);

    await tx.insert(schema.businessServices).values([
      { businessId: techStudio.id, serviceId: webDesign.id },
      { businessId: namasteRestaurant.id, serviceId: restaurant.id },
      { businessId: lilakIt.id, serviceId: webDesign.id },
      { businessId: lilakIt.id, serviceId: consulting.id },
    ]);
  });

  console.log("✅ Database synced with seed data!");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed().catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
}
