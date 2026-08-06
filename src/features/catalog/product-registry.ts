import { CHILE_PRODUCTS, CATALOG_CATEGORIES } from "./chile-products";
import type { CatalogCategory, CatalogProduct } from "./types";

/** Static product packs by country ISO code. Extend when adding new CSVs. */
export const CATALOG_PRODUCTS_BY_CODE: Record<string, CatalogProduct[]> = {
  CL: CHILE_PRODUCTS,
};

export const CATALOG_CATEGORIES_BY_CODE: Record<string, readonly CatalogCategory[]> = {
  CL: CATALOG_CATEGORIES,
};

export function getCatalogProducts(countryCode: string): CatalogProduct[] {
  return CATALOG_PRODUCTS_BY_CODE[countryCode] ?? [];
}

export function getCatalogCategories(countryCode: string): readonly CatalogCategory[] {
  return CATALOG_CATEGORIES_BY_CODE[countryCode] ?? [];
}
