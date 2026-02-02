import type { ReactNode } from "react";
import { siteConfig } from "@/shared/config";
import { Copyright } from "@/shared/ui";

const { author, license } = siteConfig;

interface BusinessDirectoryLayoutProps {
  readonly title: string;
  readonly description: string;
  readonly filters: ReactNode;
  readonly children: ReactNode;
}

export function BusinessDirectoryLayout({
  title,
  description,
  filters,
  children,
}: BusinessDirectoryLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background p-8 font-sans">
      <main className="flex flex-1 flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-balance">
              {title}
            </h1>
            <p className="text-muted-foreground mt-2 text-pretty">
              {description}
            </p>
          </div>
          {filters}
        </header>

        {children}
      </main>
      <footer className="mt-auto py-6">
        <Copyright author={author} license={license} />
      </footer>
    </div>
  );
}
