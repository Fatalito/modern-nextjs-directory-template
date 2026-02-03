import { describe, expect, it } from "vitest";
import type { ContactChannel } from "@/entities/contact";
import {
  createMockBusiness,
  createMockLocation,
  createMockService,
  createMockUser,
} from "@/shared/lib";
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
    expect(results[0].id).toBe("b1");
    expect(results[0].managerId).toBe(user.id);
    expect(results[0].name).toBe("Shop A");
  });

  describe("selectBusinessContact", () => {
    const contacts = [
      { channel: "phone" as const, locale: "en", value: "PHONE_EN" },
      { channel: "whatsapp" as const, locale: "fr", value: "WA_FR" },
    ];
    const business = createMockBusiness({ contacts });

    it.each([
      ["Exact match (channel and locale)", "en", "phone", "PHONE_EN"],
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

  describe("selectBusinessesByCriteria", () => {
    const service = createMockService({});
    const location = createMockLocation({});

    const list = [
      createMockBusiness({
        serviceIds: [service.id],
        location: { id: location.id, name: location.name, slug: location.slug },
      }),
      createMockBusiness({
        serviceIds: [service.id],
        location: { id: "other", name: "Other City", slug: "other-city" },
      }),
      createMockBusiness({
        serviceIds: ["other"],
        location: { id: location.id, name: location.name, slug: location.slug },
      }),
    ];

    it("should handle all filter combinations", () => {
      const withBothFilters = selectBusinessesByCriteria(list, {
        serviceId: service.id,
        locationId: location.id,
      });
      expect(withBothFilters).toHaveLength(1);

      const withServiceFilter = selectBusinessesByCriteria(list, {
        serviceId: service.id,
      });
      expect(withServiceFilter).toHaveLength(2);

      const withLocationFilter = selectBusinessesByCriteria(list, {
        locationId: location.id,
      });
      expect(withLocationFilter).toHaveLength(2);

      const withoutFilters = selectBusinessesByCriteria(list, {});
      expect(withoutFilters).toHaveLength(3);
    });
  });
});
