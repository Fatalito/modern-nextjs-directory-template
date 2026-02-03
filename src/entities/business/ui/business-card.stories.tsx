import type { Meta, StoryObj } from "@storybook/react";
import { createMockBusiness } from "@/shared/lib";
import { BusinessCard } from "./business-card";

const meta: Meta<typeof BusinessCard> = {
  component: BusinessCard,
  title: "Entities/Business/BusinessCard",
};
export default meta;

export const Default: StoryObj<typeof BusinessCard> = {
  args: {
    business: createMockBusiness({
      name: "Acme Coffee Shop",
      category: "hospitality",
      images: [
        "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800",
      ],
    }),
  },
};
