import type { ReactNode } from "react";
import { Copyright } from "@/shared/ui";

interface BusinessDirectoryLayoutProps {
  readonly title: string;
  readonly description: string;
  readonly filters: ReactNode;
  readonly children: ReactNode;
  readonly author: string;
  readonly license: string;
}

/**
 * BusinessDirectoryLayout provides a consistent page structure for all directory pages.
 * Includes header with title/description, filter controls, main content area, and footer.
 *
 * @param title - Page heading displayed at the top
 * @param description - Subtitle text describing the page content
 * @param filters - Filter component to display in the header (e.g., BusinessListFilters)
 * @param children - Main content area (typically BusinessList)
 * @returns Full page layout with header, content, and footer
 */
export function BusinessDirectoryLayout({
  title,
  description,
  filters,
  children,
  author,
  license,
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
