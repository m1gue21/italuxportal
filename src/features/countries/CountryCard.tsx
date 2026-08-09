import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, MapPin, BookOpen } from "lucide-react";
import { getCatalogMeta } from "@/features/catalog/catalog-meta";
import { hasCatalogProducts } from "@/features/catalog/product-registry";
import { publicCatalogsQuery } from "@/features/catalog/queries";
import type { CountryRow } from "./types";
import { CTA_ICONS } from "@/features/section-texts/cta-icons";

export function CountryCard({ country }: { country: CountryRow }) {
  const [open, setOpen] = useState(false);
  const { data: remoteCatalogs } = useQuery(publicCatalogsQuery);

  const WaIcon = CTA_ICONS[country.whatsapp_icon || "whatsapp"] ?? CTA_ICONS.whatsapp;
  const WebIcon = CTA_ICONS[country.website_icon || "Globe"] ?? CTA_ICONS.Globe;
  const addresses = Array.isArray(country.addresses) ? country.addresses.filter(Boolean) : [];
  const isLight = country.button_variant === "light";
  const catalogMeta = getCatalogMeta(country.code);
  const remote = remoteCatalogs?.find((c) => c.code === country.code && c.isActive);
  const hasInvestorCatalog =
    !!remote || (!!catalogMeta && hasCatalogProducts(country.code));
  const catalogSlug = remote?.slug ?? catalogMeta?.slug;

  const buttonBase =
    "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3.5 text-xs font-medium tracking-wide transition-all active:scale-[0.97]";
  const buttonClasses = isLight
    ? `${buttonBase} border-foreground/10 bg-foreground/95 text-background hover:bg-foreground`
    : `${buttonBase} border-gold/40 bg-white/[0.03] text-gold hover:bg-gold/10`;

  return (
    <article
      className={`group overflow-hidden rounded-2xl border bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-sm transition-all duration-500 ${
        open ? "border-gold/50" : "border-gold/15"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors active:bg-white/[0.02]"
      >
        <span className="text-4xl leading-none drop-shadow-lg" aria-hidden>
          {country.flag}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display truncate text-xl font-normal tracking-wide text-foreground">
            {country.name}
          </h3>
          {country.show_subtitle && country.subtitle && (
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.22em] text-gold/90">
              {country.subtitle}
            </p>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gold/70 transition-transform duration-500 ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.5}
        />
      </button>

      <div
        className={`grid transition-all duration-500 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-2 gap-2.5 px-5 pb-3 pt-1">
            <a
              href={country.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses}
            >
              <WaIcon className="h-4 w-4" strokeWidth={2.2} />
              {country.whatsapp_label || "WhatsApp"}
            </a>
            <a
              href={country.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses}
            >
              <WebIcon className="h-4 w-4" strokeWidth={2.2} />
              {country.website_label || "Página Web"}
            </a>
            {hasInvestorCatalog && catalogSlug && (
              <Link
                to="/$slug/catalogo"
                params={{ slug: catalogSlug }}
                className={`${buttonClasses} col-span-2 border-gold/50 bg-gold/10 text-gold hover:bg-gold/20`}
              >
                <BookOpen className="h-4 w-4" strokeWidth={2.2} />
                Catálogo Inversionistas
              </Link>
            )}
          </div>
          {addresses.length > 0 && (
            <ul className="space-y-2 px-5 pb-5 pt-2">
              {addresses.map((addr, i) => (
                <li key={i} className="flex gap-2 text-sm leading-snug text-foreground/85">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={2} />
                  <span>{addr}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
