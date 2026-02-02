import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createMockLocation,
  createMockService,
} from "@/shared/lib/mock-data/factories";
import { BusinessListFilters } from "./business-list-filters";

const mockLocations = [
  createMockLocation({
    id: "france",
    name: "France",
    slug: "france",
    type: "country",
  }),
  createMockLocation({
    id: "paris",
    name: "Paris",
    slug: "paris",
    type: "city",
    parentId: "france",
  }),
  createMockLocation({
    id: "uk",
    name: "United Kingdom",
    slug: "uk",
    type: "country",
  }),
  createMockLocation({
    id: "london",
    name: "London",
    slug: "london",
    type: "city",
    parentId: "uk",
  }),
];

const mockServices = [
  createMockService({ id: "s1", name: "Web Design", slug: "web-design" }),
  createMockService({ id: "s2", name: "Plumbing", slug: "plumbing" }),
];

describe("BusinessListFilters", () => {
  it("renders location and service filters", () => {
    render(
      <BusinessListFilters locations={mockLocations} services={mockServices} />,
    );

    // Location filters
    expect(
      screen.getByRole("link", { name: /All Locations/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Paris/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /London/i })).toBeInTheDocument();

    // Service filters
    expect(
      screen.getByRole("link", { name: /All Services/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Web Design/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Plumbing/i })).toBeInTheDocument();
  });

  describe("Active states", () => {
    it("shows active indicator on current city", () => {
      render(
        <BusinessListFilters
          locations={mockLocations}
          services={mockServices}
          countrySlug="france"
          citySlug="paris"
        />,
      );

      expect(
        screen.getByRole("link", { name: /✓ Paris/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /✓ London/i }),
      ).not.toBeInTheDocument();
    });

    it("shows active indicator on current service", () => {
      render(
        <BusinessListFilters
          locations={mockLocations}
          services={mockServices}
          serviceSlug="web-design"
        />,
      );

      expect(
        screen.getByRole("link", { name: /✓ Web Design/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /✓ Plumbing/i }),
      ).not.toBeInTheDocument();
    });

    it("shows All Locations as active when no city selected", () => {
      render(
        <BusinessListFilters
          locations={mockLocations}
          services={mockServices}
          serviceSlug="web-design"
        />,
      );

      const allLocationsButton = screen.getByRole("link", {
        name: /All Locations/i,
      });
      const className = allLocationsButton.getAttribute("class") || "";
      expect(className).toContain("bg-primary");
    });

    it("shows All Services as active when no service selected", () => {
      render(
        <BusinessListFilters
          locations={mockLocations}
          services={mockServices}
          countrySlug="france"
          citySlug="paris"
        />,
      );

      const allServicesButton = screen.getByRole("link", {
        name: /All Services/i,
      });
      const className = allServicesButton.getAttribute("class") || "";
      expect(className).toContain("bg-primary");
    });
  });

  describe("Navigation links", () => {
    it("city links preserve service when active", () => {
      render(
        <BusinessListFilters
          locations={mockLocations}
          services={mockServices}
          serviceSlug="web-design"
        />,
      );

      const parisLink = screen.getByRole("link", { name: /Paris/i });
      expect(parisLink).toHaveAttribute("href", "/france/paris/web-design");
    });

    it("city links preserve service when not active", () => {
      render(
        <BusinessListFilters
          locations={mockLocations}
          services={mockServices}
          serviceSlug="web-design"
        />,
      );

      const londonLink = screen.getByRole("link", { name: /London/i });
      expect(londonLink).toHaveAttribute("href", "/uk/london/web-design");
    });

    it("All Locations preserves service filter", () => {
      render(
        <BusinessListFilters
          locations={mockLocations}
          services={mockServices}
          serviceSlug="plumbing"
        />,
      );

      const allLocationsLink = screen.getByRole("link", {
        name: /All Locations/i,
      });
      expect(allLocationsLink).toHaveAttribute("href", "/service/plumbing");
    });

    it("All Locations goes to home when no service filter", () => {
      render(
        <BusinessListFilters
          locations={mockLocations}
          services={mockServices}
        />,
      );

      const allLocationsLink = screen.getByRole("link", {
        name: /All Locations/i,
      });
      expect(allLocationsLink).toHaveAttribute("href", "/");
    });

    it("service links use location path when available", () => {
      render(
        <BusinessListFilters
          locations={mockLocations}
          services={mockServices}
          countrySlug="france"
          citySlug="paris"
          serviceSlug="web-design"
        />,
      );

      const plumbingLink = screen.getByRole("link", { name: /Plumbing/i });
      expect(plumbingLink).toHaveAttribute("href", "/france/paris/plumbing");
    });

    it("service links go to service page when no location", () => {
      render(
        <BusinessListFilters
          locations={mockLocations}
          services={mockServices}
          serviceSlug="web-design"
        />,
      );

      const plumbingLink = screen.getByRole("link", { name: /Plumbing/i });
      expect(plumbingLink).toHaveAttribute("href", "/service/plumbing");
    });

    it("All Services clears service from current location", () => {
      render(
        <BusinessListFilters
          locations={mockLocations}
          services={mockServices}
          countrySlug="france"
          citySlug="paris"
          serviceSlug="web-design"
        />,
      );

      const allServicesLink = screen.getByRole("link", {
        name: /All Services/i,
      });
      expect(allServicesLink).toHaveAttribute("href", "/france/paris");
    });

    it("All Services goes to home when no location", () => {
      render(
        <BusinessListFilters
          locations={mockLocations}
          services={mockServices}
          serviceSlug="web-design"
        />,
      );

      const allServicesLink = screen.getByRole("link", {
        name: /All Services/i,
      });
      expect(allServicesLink).toHaveAttribute("href", "/");
    });
  });
});
