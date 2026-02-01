import { cn } from "@/shared/lib/utils";

interface CopyrightProps {
  readonly author?: string;
  readonly year?: number | string;
  readonly license?: string;
  readonly className?: string;
}

export function Copyright({
  author,
  year,
  license,
  className,
}: CopyrightProps) {
  const currentYear = year ?? new Date().getFullYear();

  const parts: string[] = [currentYear.toString()];
  if (author) parts.push(author);
  if (license) parts.push(license);

  const copyrightText = parts.join(" ");

  return (
    <div className={cn("text-xs text-muted-foreground", className)}>
      &copy; {copyrightText}.
    </div>
  );
}
