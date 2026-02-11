import { describe, expect, it } from "vitest";
import type { ContactChannel } from "@/entities/contact";
import {
  createBusiness,
  createLocation,
  createService,
  createUser,
} from "@/shared/api/seed-factories";
import {
  selectBusinessContact,
  selectBusinessesByCriteria,
  selectManagedBusinesses,
} from "./selectors";

describe("Business Selectors", () => {
  const user = createUser();
  const businesses = [
    createBusiness({ managerId: user.id, name: "Shop A" }),
    createBusiness({ name: "Shop B" }),
  ];

  it("should filter businesses by managerId", () => {
    const results = selectManagedBusinesses(businesses, user.id);
    expect(results).toHaveLength(1);
    expect(results[0].managerId).toBe(user.id);
    expect(results[0].name).toBe("Shop A");
  });

  describe("selectBusinessContact", () => {
    const contacts = [
      { channel: "phone" as const, locale: "en", value: "12345678912" },
      { channel: "whatsapp" as const, locale: "fr", value: "12345678913" },
    ];
    const business = createBusiness({ contacts });

    it.each([
      ["Exact match (channel and locale)", "en", "phone", "12345678912"],
      ["Channel priority (wrong locale)", "fr", "phone", "12345678912"],
      ["Locale priority (wrong channel)", "fr", "telegram", "12345678913"],
      ["Total fallback", "zh", "telegram", "12345678912"],
      ["No channel", "zh", undefined, "12345678912"],
    ])("%s", (_, locale, channel, expectedValue) => {
      const result = selectBusinessContact(business, {
        locale,
        channel: channel as ContactChannel | undefined,
      });
      expect(result.value).toBe(expectedValue);
    });
  });

  describe("selectBusinessesByCriteria", () => {
    const service = createService({});
    const location = createLocation({});

    const list = [
      createBusiness({
        serviceIds: [service.id],
        location,
      }),
      createBusiness({
        serviceIds: [service.id],
        location: createLocation({ name: "Other City", slug: "other-city" }),
      }),
      createBusiness({
        serviceIds: [
          createService({ name: "Other Service", slug: "other-service" }).id,
        ],
        location,
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
