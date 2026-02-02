const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const imageHosts = ["images.unsplash.com"] as const;

export const siteConfig = {
  name: "Directory",
  description:
    "A modern, scalable Next.js directory template designed with performance, maintainability, and developer experience in mind.",
  url: baseUrl,
  ogImage: `${baseUrl}/og-image.png`,
  author: "Fatalito",
  links: {
    github: "https://github.com/Fatalito/modern-nextjs-directory-template",
  },
  license: "Apache 2.0",
} as const;

export type SiteConfig = typeof siteConfig;
