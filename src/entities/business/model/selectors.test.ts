import { describe, expect, it } from "vitest";
import {
  createMockBusiness,
  createMockLocation,
  createMockService,
  createMockUser,
} from "@/shared/lib/mock-data/factories";
import type { ContactChannel } from "./schema";
import {
  selectBusinessContact,
  selectBusinessesByCriteria,
  selectManagedBusinesses,
} from "./selectors";

describe("Business Selectors", () => {
  const user = createMockUser({ id: "manager-1" });
  const businesses = [
    createMockBusiness({ id: "b1", managerId: user.id, name: "Shop A" }),
    createMockBusiness({ id: "b2", managerId: "other-user", name: "Shop B" }),
  ];

  it("should filter businesses by managerId", () => {
    const results = selectManagedBusinesses(businesses, user.id);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Shop A");
  });

  describe("selectBusinessContact - Branch Coverage Suite", () => {
    const contacts = [
      { channel: "phone" as const, locale: "en", value: "PHONE_EN" },
      { channel: "whatsapp" as const, locale: "fr", value: "WA_FR" },
    ];
    const business = createMockBusiness({ contacts });

    it.each([
      ["Exact match", "en", "phone", "PHONE_EN"],
      ["Channel priority (wrong locale)", "fr", "phone", "PHONE_EN"],
      ["Locale priority (wrong channel)", "fr", "telegram", "WA_FR"],
      ["Total fallback", "zh", "telegram", "PHONE_EN"],
      ["No channel", "zh", undefined, "PHONE_EN"],
    ])("%s", (_, locale, channel, expectedValue) => {
      const result = selectBusinessContact(business, {
        locale,
        channel: channel as ContactChannel | undefined,
      });
      expect(result.value).toBe(expectedValue);
    });
  });
});

describe("selectBusinessesByCriteria", () => {
  const service = createMockService({});
  const location = createMockLocation({});

  const list = [
    createMockBusiness({ serviceIds: [service.id], locationId: location.id }), // Both match
    createMockBusiness({ serviceIds: [service.id], locationId: "other" }), // Service only
    createMockBusiness({ serviceIds: ["other"], locationId: location.id }), // Location only
  ];

  it("should handle all filter combinations (Branch Coverage)", () => {
    // 1. Both filters
    const both = selectBusinessesByCriteria(list, {
      serviceId: service.id,
      locationId: location.id,
    });
    expect(both).toHaveLength(1);

    // 2. Service only
    const serviceOnly = selectBusinessesByCriteria(list, {
      serviceId: service.id,
    });
    expect(serviceOnly).toHaveLength(2);

    // 3. Location only
    const locationOnly = selectBusinessesByCriteria(list, {
      locationId: location.id,
    });
    expect(locationOnly).toHaveLength(2);

    // 4. No filters (Empty object)
    const none = selectBusinessesByCriteria(list, {});
    expect(none).toHaveLength(3);
  });
});
