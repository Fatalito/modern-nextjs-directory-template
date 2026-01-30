import { cn } from "@/shared/lib/utils";

interface CopyrightProps {
  author?: string;
  year?: number | string;
  license?: string;
  className?: string;
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
