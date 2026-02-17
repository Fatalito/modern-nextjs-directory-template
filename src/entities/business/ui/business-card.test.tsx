import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createBusiness, createLocation } from "@/shared/testing";
import { BusinessCard } from "./business-card";

vi.mock("next/image", () => ({
  default: vi.fn(({ src, alt }) => (
    <div role="img" aria-label={alt} data-src={src} /> // NOSONAR(typescript:S6819) - Can't use <img> due to biome/performance/noImgElement rule
  )),
}));

describe("BusinessCard", () => {
  it("renders card with image, name, category, and location", () => {
    const us = createLocation({
      name: "United States",
      slug: "united-states",
      type: "country",
    });
    const business = createBusiness({
      name: "Acme Corp",
      category: "tech",
      location: createLocation({
        name: "New York",
        slug: "new-york",
        type: "city",
        parentId: us.id,
      }),
      images: [
        "https://example.com/first.jpg",
        "https://example.com/second.jpg",
      ],
    });

    render(<BusinessCard business={business} />);

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("tech")).toBeInTheDocument();
    expect(screen.getByText(/New York/)).toBeInTheDocument();

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("aria-label", "Acme Corp");
    expect(image).toHaveAttribute("data-src", "https://example.com/first.jpg");
  });
});
