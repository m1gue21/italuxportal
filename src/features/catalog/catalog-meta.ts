export type CatalogCurrency = "CLP" | "COP" | "USD" | "EUR";

export type CatalogCountryMeta = {
  code: string;
  name: string;
  slug: string;
  flag: string;
  currency: CatalogCurrency;
  locale: string;
};

export const CATALOG_COUNTRIES: CatalogCountryMeta[] = [
  {
    code: "CL",
    name: "Chile",
    slug: "chile",
    flag: "🇨🇱",
    currency: "CLP",
    locale: "es-CL",
  },
  {
    code: "CO",
    name: "Colombia",
    slug: "colombia",
    flag: "🇨🇴",
    currency: "COP",
    locale: "es-CO",
  },
  {
    code: "EC",
    name: "Ecuador",
    slug: "ecuador",
    flag: "🇪🇨",
    currency: "USD",
    locale: "es-EC",
  },
  {
    code: "ES",
    name: "España",
    slug: "espana",
    flag: "🇪🇸",
    currency: "EUR",
    locale: "es-ES",
  },
];

export const CATALOG_BY_CODE = Object.fromEntries(
  CATALOG_COUNTRIES.map((c) => [c.code, c]),
) as Record<string, CatalogCountryMeta>;

export const CATALOG_BY_SLUG = Object.fromEntries(
  CATALOG_COUNTRIES.map((c) => [c.slug, c]),
) as Record<string, CatalogCountryMeta>;

export function getCatalogMeta(code: string): CatalogCountryMeta | undefined {
  return CATALOG_BY_CODE[code];
}

export function getCatalogMetaBySlug(slug: string): CatalogCountryMeta | undefined {
  return CATALOG_BY_SLUG[slug];
}
