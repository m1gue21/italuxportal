import { CHILE_PRODUCTS, CATALOG_CATEGORIES } from "./chile-products";
import { COLOMBIA_PRODUCTS } from "./colombia-products";
import { ECUADOR_PRODUCTS } from "./ecuador-products";
import { SPAIN_PRODUCTS } from "./spain-products";
import type { CatalogCategory, CatalogProduct } from "./types";

/** Packs estáticos (seed / fallback). Pueden no traer mayoristaPrice. */
type PackProduct = Omit<
  CatalogProduct,
  "mayoristaPrice" | "mayoristaIsProvisional" | "mayoristaMatch"
> & {
  mayoristaPrice?: number;
};

const RAW_PACKS: Record<string, PackProduct[]> = {
  CL: CHILE_PRODUCTS as PackProduct[],
  CO: COLOMBIA_PRODUCTS as PackProduct[],
  EC: ECUADOR_PRODUCTS as PackProduct[],
  ES: SPAIN_PRODUCTS as PackProduct[],
};

/** Completa mayorista provisional (retail × 0.70) si el pack no lo trae. */
export function withMayoristaFallback(product: PackProduct): CatalogProduct {
  if (product.mayoristaPrice != null && Number.isFinite(product.mayoristaPrice)) {
    return {
      ...product,
      mayoristaPrice: product.mayoristaPrice,
      mayoristaIsProvisional: product.mayoristaIsProvisional ?? false,
      mayoristaMatch: product.mayoristaMatch ?? "manual",
    };
  }
  const approx = Math.round(product.retailPrice * 0.7 * 100) / 100;
  return {
    ...product,
    mayoristaPrice: approx,
    mayoristaIsProvisional: true,
    mayoristaMatch: "fallback",
  };
}

export const CATALOG_PRODUCTS_BY_CODE: Record<string, CatalogProduct[]> = Object.fromEntries(
  Object.entries(RAW_PACKS).map(([code, products]) => [
    code,
    products.map(withMayoristaFallback),
  ]),
);

export const CATALOG_CATEGORIES_BY_CODE: Record<string, readonly CatalogCategory[]> = {
  CL: CATALOG_CATEGORIES,
  CO: CATALOG_CATEGORIES,
  EC: CATALOG_CATEGORIES,
  ES: CATALOG_CATEGORIES,
};

export function getCatalogProducts(countryCode: string): CatalogProduct[] {
  return CATALOG_PRODUCTS_BY_CODE[countryCode] ?? [];
}

export function getCatalogCategories(countryCode: string): readonly CatalogCategory[] {
  return CATALOG_CATEGORIES_BY_CODE[countryCode] ?? CATALOG_CATEGORIES;
}

export function hasCatalogProducts(countryCode: string): boolean {
  return (CATALOG_PRODUCTS_BY_CODE[countryCode]?.length ?? 0) > 0;
}
