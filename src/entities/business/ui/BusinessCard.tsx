import type { VariantProps } from "class-variance-authority";
import type { Business } from "@/entities/business";
import { selectBusinessContact } from "@/entities/business";
import type { Contact } from "@/entities/contact";
import { getContactUri } from "@/entities/contact";
import { Button } from "@/shared/ui/button";

interface BusinessCardProps {
  readonly business: Business;
  readonly locale: string;
}

interface ContactButtonConfig {
  readonly variant: VariantProps<typeof Button>["variant"];
  readonly label: string;
}

const getContactButtonConfig = (contact: Contact): ContactButtonConfig => {
  switch (contact.channel) {
    case "whatsapp":
      return { variant: "secondary", label: "Message us" };
    case "telegram":
      return { variant: "outline", label: "Chat on Telegram" };
    case "phone":
      return { variant: "default", label: "Call us" };
  }
};

export function BusinessCard({ business, locale }: BusinessCardProps) {
  const primaryContact = selectBusinessContact(business, {
    locale,
    channel: "whatsapp",
  });

  // Fallback: schema ensures at least one contact, but handle gracefully if not
  if (!primaryContact) {
    return (
      <div className="rounded-xl border border-slate-200 p-4 shadow-sm opacity-50">
        <h3 className="text-lg font-bold text-slate-900">{business.name}</h3>
        <p className="text-xs text-slate-400">
          No contact information available
        </p>
      </div>
    );
  }

  const contactUri = getContactUri(primaryContact);
  const { variant, label } = getContactButtonConfig(primaryContact);

  return (
    <div className="rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-slate-900">{business.name}</h3>
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
        {business.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-full">
          {business.category}
        </span>

        <Button variant={variant} size="sm" asChild>
          <a href={contactUri} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        </Button>
      </div>
    </div>
  );
}
