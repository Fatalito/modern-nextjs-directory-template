import { describe, expect, it } from "vitest";
import { pageContent } from "./content-templates";

describe("Content Templates", () => {
  describe("cityPage", () => {
    it("generates metadata with city and country", () => {
      const { title, description } = pageContent.cityPage.metadata(
        "Paris",
        "France",
      );
      expect(title).toBe("Businesses in Paris, France");
      expect(description).toContain("Paris");
      expect(description).toContain("France");
    });

    it("generates page title", () => {
      const title = pageContent.cityPage.pageTitle("London", "UK");
      expect(title).toBe("London, UK");
    });

    it("generates page description", () => {
      const description = pageContent.cityPage.pageDescription("Berlin");
      expect(description).toContain("Berlin");
    });
  });

  describe("servicePage", () => {
    it("generates metadata", () => {
      const { title, description } =
        pageContent.servicePage.metadata("Plumbing");
      expect(title).toBe("Plumbing Services");
      expect(description).toContain("plumbing");
    });

    it("generates page title", () => {
      const title = pageContent.servicePage.pageTitle("Electrician");
      expect(title).toBe("Electrician Services");
    });

    it("generates page description", () => {
      const description = pageContent.servicePage.pageDescription("Carpentry");
      expect(description).toContain("carpentry");
    });
  });

  describe("cityServicePage", () => {
    it("generates metadata", () => {
      const { title, description } = pageContent.cityServicePage.metadata(
        "Restaurant",
        "Tokyo",
        "Japan",
      );
      expect(title).toBe("Restaurant in Tokyo, Japan");
      expect(description).toContain("Tokyo");
      expect(description).toContain("Japan");
      expect(description).toContain("restaurant");
    });

    it("generates page title", () => {
      const title = pageContent.cityServicePage.pageTitle(
        "Cafe",
        "Seoul",
        "Korea",
      );
      expect(title).toBe("Cafe in Seoul, Korea");
    });

    it("generates page description", () => {
      const description = pageContent.cityServicePage.pageDescription(
        "Fitness",
        "Beijing",
      );
      expect(description).toContain("fitness");
      expect(description).toContain("Beijing");
    });
  });

  describe("businessList", () => {
    it("generates discovery heading", () => {
      expect(pageContent.businessList.discoveryHeading(5)).toBe(
        "Discovery (5)",
      );
    });

    it.each([
      [
        "city and service",
        () =>
          pageContent.businessList.emptyState.cityAndService("Bakery", "Paris"),
        "No Bakery services in Paris yet!",
      ],
      [
        "service only",
        () =>
          pageContent.businessList.emptyState.serviceOnly("Plumbing", "MySite"),
        "No Plumbing services on MySite yet!",
      ],
      [
        "city only",
        () => pageContent.businessList.emptyState.cityOnly("London"),
        "No businesses in London yet!",
      ],
      [
        "no filters",
        () => pageContent.businessList.emptyState.noFilters(),
        "No businesses match your selection.",
      ],
    ])("generates empty state for %s", (_, getMessage, expected) => {
      expect(getMessage()).toBe(expected);
    });
  });

  describe("notFound", () => {
    it.each([
      ["location", pageContent.notFound.location.title, "Location Not Found"],
      ["service", pageContent.notFound.service.title, "Service Not Found"],
    ])("has %s not found title", (_, actual, expected) => {
      expect(actual).toBe(expected);
    });
  });
});
