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
  return (
    <div className={cn("text-xs text-muted-foreground", className)}>
      &copy; {currentYear} {author}. {license && `${license}.`}
    </div>
  );
}
