import { cn } from "@/shared/lib";

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
  const displayYear = year ?? new Date().getFullYear();

  return (
    <div className={cn("text-xs text-muted-foreground", className)}>
      &copy; <time dateTime={displayYear.toString()}>{displayYear}</time>
      {author && ` ${author}`}
      {license && ` ${license}`}.
    </div>
  );
}
