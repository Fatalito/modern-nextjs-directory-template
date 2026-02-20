import type { Meta, StoryObj } from "@storybook/react";
import { createBusiness } from "@/shared/testing";
import { BusinessList } from "./business-list";

const meta: Meta<typeof BusinessList> = {
  component: BusinessList,
  title: "Widgets/BusinessList",
};
export default meta;

export const WithMultipleBusinesses: StoryObj<typeof BusinessList> = {
  args: {
    businesses: [
      createBusiness({
        name: "Acme Coffee Shop",
        category: "hospitality",
        images: [
          "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=600&fit=crop",
        ],
      }),
      createBusiness({
        name: "Tech Solutions Inc",
        category: "tech",
        images: [
          "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=600&fit=crop",
        ],
      }),
      createBusiness({
        name: "Fitness Studio",
        category: "health",
        images: [
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=600&fit=crop",
        ],
      }),
    ],
  },
};

export const SingleBusiness: StoryObj<typeof BusinessList> = {
  args: {
    businesses: [
      createBusiness({
        name: "Solo Shop",
        category: "retail",
        images: [
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop",
        ],
      }),
    ],
  },
};

export const EmptyState: StoryObj<typeof BusinessList> = {
  args: {
    businesses: [],
  },
};
