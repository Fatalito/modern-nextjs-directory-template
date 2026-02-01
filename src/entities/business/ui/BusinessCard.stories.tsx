// BusinessCard.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { createMockBusiness } from "../../../shared/lib/mock-data/factories";
import { BusinessCard } from "./BusinessCard";

const meta: Meta<typeof BusinessCard> = {
  component: BusinessCard,
  title: "Entities/Business/BusinessCard",
};
export default meta;

export const WhatsApp: StoryObj<typeof BusinessCard> = {
  args: {
    business: createMockBusiness({
      name: "WhatsApp Business",
      description: "Contact us via WhatsApp",
      contacts: [
        { channel: "whatsapp" as const, value: "12025550123", locale: "en" },
      ],
    }),
    locale: "en",
  },
};

export const Telegram: StoryObj<typeof BusinessCard> = {
  args: {
    business: createMockBusiness({
      name: "Telegram Business",
      description: "Message us on Telegram",
      contacts: [
        { channel: "telegram" as const, value: "nas_dev", locale: "en" },
      ],
    }),
    locale: "en",
  },
};

export const Phone: StoryObj<typeof BusinessCard> = {
  args: {
    business: createMockBusiness({
      name: "Phone Business",
      description: "Call us anytime",
      contacts: [
        { channel: "phone" as const, value: "12025550123", locale: "en" },
      ],
    }),
    locale: "en",
  },
};

export const MultipleContacts: StoryObj<typeof BusinessCard> = {
  args: {
    business: createMockBusiness({
      name: "Multi-Channel Business",
      description: "Reach us via your preferred channel",
      contacts: [
        { channel: "whatsapp" as const, value: "12025550123", locale: "en" },
        {
          channel: "telegram" as const,
          value: "business_handle",
          locale: "en",
        },
        { channel: "phone" as const, value: "12025550456", locale: "en" },
      ],
    }),
    locale: "en",
  },
};
