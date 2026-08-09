import type {
  InvestorCatalogRow,
  InvestorProductRow,
} from "@/integrations/supabase/types";
import type { CatalogCurrency } from "./catalog-meta";
import type { CatalogCategory, CatalogProduct, MayoristaMatch } from "./types";

const CATEGORIES = new Set<CatalogCategory>([
  "Cadenas",
  "Pulseras",
  "Dijes",
  "Combos",
  "Hombre",
  "Mujer",
]);

export function mapProductRow(row: InvestorProductRow): CatalogProduct {
  return {
    handle: row.handle,
    title: row.title,
    sku: row.sku ?? "",
    retailPrice: Number(row.retail_price),
    compareAtPrice:
      row.compare_at_price == null ? null : Number(row.compare_at_price),
    mayoristaPrice: Number(row.mayorista_price),
    mayoristaIsProvisional: row.mayorista_is_provisional,
    mayoristaMatch: (row.mayorista_match as MayoristaMatch | null) ?? null,
    imageUrl: row.image_url ?? "",
    galleryUrls: Array.isArray(row.gallery_urls) ? row.gallery_urls : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    categories: (row.categories ?? []).filter((c): c is CatalogCategory =>
      CATEGORIES.has(c as CatalogCategory),
    ),
  };
}

export type PublicCatalog = {
  code: string;
  name: string;
  flag: string;
  slug: string;
  currency: CatalogCurrency;
  locale: string;
  title: string;
  buttonLabel: string;
  isActive: boolean;
  empresarioDiscount: number;
};

export function mapCatalogRow(row: InvestorCatalogRow): PublicCatalog {
  return {
    code: row.code,
    name: row.name,
    flag: row.flag,
    slug: row.slug,
    currency: row.currency,
    locale: row.locale,
    title: row.title,
    buttonLabel: row.button_label,
    isActive: row.is_active,
    empresarioDiscount: Number(row.empresario_discount),
  };
}
