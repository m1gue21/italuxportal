import type { CatalogProduct, InvestorRole } from "./types";
import type { CatalogCurrency } from "./catalog-meta";

/** % fijo: empresario = mayorista × (1 − discount) */
export const DEFAULT_EMPRESARIO_DISCOUNT = 0.3;

export type PricingConfig = {
  empresarioDiscount: number;
};

export const DEFAULT_PRICING: PricingConfig = {
  empresarioDiscount: DEFAULT_EMPRESARIO_DISCOUNT,
};

function isZeroDecimal(currency: CatalogCurrency): boolean {
  return currency === "CLP" || currency === "COP";
}

export function roundMoney(amount: number, currency: CatalogCurrency = "CLP"): number {
  if (isZeroDecimal(currency)) return Math.round(amount);
  return Math.round(amount * 100) / 100;
}

/** Precio mayorista: campo del producto (no se calcula desde retail). */
export function mayoristaPrice(
  product: Pick<CatalogProduct, "mayoristaPrice"> | number,
  currency: CatalogCurrency = "CLP",
): number {
  const amount = typeof product === "number" ? product : Number(product.mayoristaPrice);
  return roundMoney(amount, currency);
}

type PricedProduct = Pick<CatalogProduct, "mayoristaPrice" | "empresarioPrice">;

/** True si el producto trae su propio precio empresario (tabla del país). */
export function hasOwnEmpresarioPrice(product: PricedProduct | number): boolean {
  if (typeof product === "number") return false;
  return product.empresarioPrice != null && Number.isFinite(product.empresarioPrice);
}

/**
 * Empresario: precio de la tabla del país si lo hay; si no, se calcula
 * restando el descuento configurado al mayorista.
 */
export function empresarioPrice(
  product: PricedProduct | number,
  config: PricingConfig = DEFAULT_PRICING,
  currency: CatalogCurrency = "CLP",
): number {
  if (typeof product !== "number" && hasOwnEmpresarioPrice(product)) {
    return roundMoney(Number(product.empresarioPrice), currency);
  }
  const mayorista = mayoristaPrice(product, currency);
  return roundMoney(mayorista * (1 - config.empresarioDiscount), currency);
}

export function priceForRole(
  product: PricedProduct | number,
  role: InvestorRole,
  config: PricingConfig = DEFAULT_PRICING,
  currency: CatalogCurrency = "CLP",
): number {
  return role === "empresario"
    ? empresarioPrice(product, config, currency)
    : mayoristaPrice(product, currency);
}

export function formatPrice(
  amount: number,
  currency: CatalogCurrency = "CLP",
  locale = "es-CL",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: isZeroDecimal(currency) ? 0 : 2,
    minimumFractionDigits: isZeroDecimal(currency) ? 0 : 2,
  }).format(amount);
}

/** @deprecated use formatPrice */
export function formatClp(amount: number): string {
  return formatPrice(amount, "CLP", "es-CL");
}

export function roleLabel(role: InvestorRole): string {
  return role === "empresario" ? "Empresario" : "Mayorista";
}

export function empresarioPct(config: PricingConfig = DEFAULT_PRICING): number {
  return Math.round(config.empresarioDiscount * 100);
}

/** Compat: UI antigua mostraba “−30% / −60%”; ahora solo −30% sobre mayorista. */
export function mayoristaPct(): number {
  return 0;
}

export const EMPRESARIO_DISCOUNT = DEFAULT_EMPRESARIO_DISCOUNT;
export const EMPRESARIO_PCT = Math.round(DEFAULT_EMPRESARIO_DISCOUNT * 100);

/** @deprecated — el mayorista ya no es un % del retail */
export const DEFAULT_MAYORISTA_DISCOUNT = 0;
export const DEFAULT_EMPRESARIO_EXTRA = DEFAULT_EMPRESARIO_DISCOUNT;
export const MAYORISTA_DISCOUNT = 0;
export const EMPRESARIO_EXTRA = DEFAULT_EMPRESARIO_DISCOUNT;
export const MAYORISTA_PCT = 0;
