import { relations, sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import type { CategoryValue } from "@/entities/business";
import type { Contact } from "@/entities/contact";
import type { LocationTypeValue } from "@/entities/location";
import type { UserRoleType } from "@/entities/user";
import { jsonColumn } from "./custom-types";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  website: text("website"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<UserRoleType>().notNull().default("business_owner"),
  contacts: jsonColumn<Contact[]>("contacts").$type<Contact[]>().notNull(),

  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  lastLogin: text("last_login"),
});

export const locations = sqliteTable("locations", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  parentId: text("parent_id").references((): AnySQLiteColumn => locations.id, {
    onDelete: "restrict",
  }),
  type: text("type").$type<LocationTypeValue>().notNull(),
  isoCode: text("iso_code"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const services = sqliteTable("services", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon"),
  description: text("description"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const businesses = sqliteTable("businesses", {
  id: text("id").primaryKey(),
  managerId: text("manager_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  website: text("website"),

  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),

  email: text("email").notNull(),

  category: text("category").$type<CategoryValue>().notNull(),

  locationId: text("location_id")
    .references(() => locations.id, { onDelete: "restrict" })
    .notNull(),

  images: jsonColumn<string[]>("images").notNull(),
  contacts: jsonColumn<Contact[]>("contacts").notNull(),
  languages: jsonColumn<string[]>("languages").notNull(),

  directoryName: text("directory_name").notNull(),
  publishedAt: text("published_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const businessServices = sqliteTable(
  "business_services",
  {
    businessId: text("business_id")
      .references(() => businesses.id, { onDelete: "cascade" })
      .notNull(),
    serviceId: text("service_id")
      .references(() => services.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.businessId, t.serviceId] })],
);

export const businessRelations = relations(businesses, ({ one, many }) => ({
  manager: one(users, {
    fields: [businesses.managerId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [businesses.locationId],
    references: [locations.id],
  }),
  businessServices: many(businessServices),
}));

export const serviceRelations = relations(services, ({ many }) => ({
  businessServices: many(businessServices),
}));

export const userRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
}));

export const businessServicesRelations = relations(
  businessServices,
  ({ one }) => ({
    business: one(businesses, {
      fields: [businessServices.businessId],
      references: [businesses.id],
    }),
    service: one(services, {
      fields: [businessServices.serviceId],
      references: [services.id],
    }),
  }),
);

export const locationsRelations = relations(locations, ({ one, many }) => ({
  parent: one(locations, {
    fields: [locations.parentId],
    references: [locations.id],
    relationName: "location_hierarchy",
  }),
  children: many(locations, {
    relationName: "location_hierarchy",
  }),
}));
