import { MapPin } from "lucide-react";
import Image from "next/image";
import type { Business } from "@/entities/business";

interface BusinessCardProps {
  readonly business: Business;
  readonly priority?: boolean;
}

/**
 * Get business location name for display.
 * Safe to access business.location directly because BusinessSchema requires it.
 */
const getLocationName = (business: Business): string => business.location.name;

/**
 * BusinessCard displays a single business with image, name, and location.
 * Optimised for LCP with priority loading on first card.
 *
 * @param business - Business entity to display
 * @param priority - Whether to prioritise image loading (default: false)
 * @returns Card component with business information
 */
export function BusinessCard({
  business,
  priority = false,
}: BusinessCardProps) {
  const primaryImage = business.images[0];

  return (
    <div className="w-56 rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative overflow-hidden rounded-lg group">
        <div className="w-full max-w-[13.75rem] aspect-[11/16] relative overflow-hidden">
          <Image
            src={primaryImage}
            alt={business.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 220px"
            priority={priority}
            quality={75}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-start justify-between p-3">
          <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-900">
            {business.category}
          </span>
          <h3 className="text-white font-bold text-base line-clamp-2 text-balance">
            {business.name}
          </h3>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <p className="text-xs flex items-center gap-1 text-slate-500">
          <MapPin className="h-3 w-3" /> {getLocationName(business)}
        </p>
      </div>
    </div>
  );
}
