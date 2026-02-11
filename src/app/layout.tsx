import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { siteConfig } from "@/shared/config";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
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

const CspNonce = async () => {
  const nonce = (await headers()).get("x-nonce") || "";
  return <meta name="csp-nonce" content={nonce} />;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <CspNonce />
      </head>
      <body>{children}</body>
    </html>
  );
}
