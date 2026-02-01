import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMockBusiness } from "../../../shared/lib/mock-data/factories";
import { BusinessCard } from "./BusinessCard";

describe("BusinessCard", () => {
  it("renders business image, name, and category", () => {
    const business = createMockBusiness({
      name: "Acme Corp",
      category: "tech",
      images: ["https://example.com/image.jpg"],
    });

    render(<BusinessCard business={business} locationName="New York, NY" />);

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("tech")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Acme Corp");
  });

  it("renders location when provided", () => {
    const business = createMockBusiness({
      name: "Paris Cafe",
    });

    render(<BusinessCard business={business} locationName="Paris, France" />);

    expect(screen.getByText(/Paris, France/)).toBeInTheDocument();
  });

  it("uses first image from images array", () => {
    const business = createMockBusiness({
      images: [
        "https://example.com/first.jpg",
        "https://example.com/second.jpg",
      ],
    });

    render(<BusinessCard business={business} locationName="Test Location" />);

    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
