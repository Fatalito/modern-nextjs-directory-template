import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/shared/config";
import { createMockBusiness } from "@/shared/lib/mock-data/factories";
import { BusinessList } from "./business-list";

describe("BusinessList", () => {
  it("renders multiple businesses with correct count", () => {
    const businesses = [
      createMockBusiness({ id: "b1", name: "Business One" }),
      createMockBusiness({ id: "b2", name: "Business Two" }),
      createMockBusiness({ id: "b3", name: "Business Three" }),
    ];

    render(<BusinessList businesses={businesses} />);

    expect(screen.getByText("Discovery (3)")).toBeInTheDocument();
    expect(screen.getByText("Business One")).toBeInTheDocument();
    expect(screen.getByText("Business Two")).toBeInTheDocument();
    expect(screen.getByText("Business Three")).toBeInTheDocument();
  });

  it("renders single business with priority prop on first card", () => {
    const businesses = [createMockBusiness({ name: "Solo Business" })];

    render(<BusinessList businesses={businesses} />);

    expect(screen.getByText("Discovery (1)")).toBeInTheDocument();
    expect(screen.getByText("Solo Business")).toBeInTheDocument();
  });

  describe("Empty state messages", () => {
    it.each([
      [
        "city + service",
        { cityName: "Paris", serviceName: "Web Design" },
        "No Web Design services in Paris yet!",
      ],
      [
        "service only",
        { serviceName: "Plumbing" },
        `No Plumbing services on ${siteConfig.name} yet!`,
      ],
      ["city only", { cityName: "London" }, "No businesses in London yet!"],
      ["no filters", {}, "No businesses match your selection."],
    ])("shows contextual message for %s filter", (_, props, expectedMessage) => {
      render(<BusinessList businesses={[]} {...props} />);
      expect(screen.getByText(expectedMessage)).toBeInTheDocument();
    });
  });
});
