import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteConfig } from "@/shared/config";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const { name, description, url, author, license, links } = siteConfig;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: name,
    template: `%s | ${name}`,
  },
  description,
  authors: [{ name: author, url: links.github }],
  creator: author,
  openGraph: {
    type: "website",
    locale: "en_US", // eventually be dynamic based on i18n [locale]
    url,
    title: name,
    description,
    siteName: name,
  },
  twitter: {
    card: "summary_large_image",
  },
  other: {
    license,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
