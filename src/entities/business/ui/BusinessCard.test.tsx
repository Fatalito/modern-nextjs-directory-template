import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Contact } from "@/entities/contact";
import { createMockBusiness } from "../../../shared/lib/mock-data/factories";
import { BusinessCard } from "./BusinessCard";

interface ContactTestCase {
  readonly channel: Contact["channel"];
  readonly value: string;
  readonly buttonText: RegExp;
  readonly expectedHref: string;
}

const contactTestCases: readonly ContactTestCase[] = [
  {
    channel: "telegram",
    value: "nas_dev",
    buttonText: /chat on telegram/i,
    expectedHref: "https://t.me/nas_dev",
  },
  {
    channel: "phone",
    value: "12025550123",
    buttonText: /call us/i,
    expectedHref: "tel:+12025550123",
  },
  {
    channel: "whatsapp",
    value: "12025550123",
    buttonText: /message us/i,
    expectedHref: "https://wa.me/12025550123",
  },
];

describe("BusinessCard Integration", () => {
  contactTestCases.forEach(({ channel, value, buttonText, expectedHref }) => {
    it(`renders ${channel} contact with correct text and link`, () => {
      const business = createMockBusiness({
        contacts: [{ channel, value, locale: "en" } as const],
      });

      render(<BusinessCard business={business} locale="en" />);

      const link = screen.getByRole("link", { name: buttonText });
      expect(link).toHaveAttribute("href", expectedHref);
    });
  });

  it("renders empty state when no contacts available", () => {
    const business = createMockBusiness({
      contacts: [],
    });

    render(<BusinessCard business={business} locale="en" />);

    expect(
      screen.getByText("No contact information available"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
