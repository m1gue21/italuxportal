import type { InvestorRole } from "./types";

/** Defaults when catalog config is unavailable */
export const DEFAULT_MAYORISTA_DISCOUNT = 0.3;
export const DEFAULT_EMPRESARIO_EXTRA = 0.3;

export type PricingConfig = {
  mayoristaDiscount: number;
  empresarioExtra: number;
};

export const DEFAULT_PRICING: PricingConfig = {
  mayoristaDiscount: DEFAULT_MAYORISTA_DISCOUNT,
  empresarioExtra: DEFAULT_EMPRESARIO_EXTRA,
};

export function mayoristaPrice(retail: number, config: PricingConfig = DEFAULT_PRICING): number {
  return Math.round(retail * (1 - config.mayoristaDiscount));
}

export function empresarioPrice(retail: number, config: PricingConfig = DEFAULT_PRICING): number {
  return Math.round(retail * (1 - (config.mayoristaDiscount + config.empresarioExtra)));
}

export function priceForRole(
  retail: number,
  role: InvestorRole,
  config: PricingConfig = DEFAULT_PRICING,
): number {
  return role === "empresario" ? empresarioPrice(retail, config) : mayoristaPrice(retail, config);
}

export function formatClp(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function roleLabel(role: InvestorRole): string {
  return role === "empresario" ? "Empresario" : "Mayorista";
}

export function mayoristaPct(config: PricingConfig = DEFAULT_PRICING): number {
  return Math.round(config.mayoristaDiscount * 100);
}

export function empresarioPct(config: PricingConfig = DEFAULT_PRICING): number {
  return Math.round((config.mayoristaDiscount + config.empresarioExtra) * 100);
}

/** @deprecated use mayoristaPct(config) */
export const MAYORISTA_DISCOUNT = DEFAULT_MAYORISTA_DISCOUNT;
/** @deprecated use empresarioPct(config) */
export const EMPRESARIO_EXTRA = DEFAULT_EMPRESARIO_EXTRA;
export const MAYORISTA_PCT = Math.round(DEFAULT_MAYORISTA_DISCOUNT * 100);
export const EMPRESARIO_PCT = Math.round(
  (DEFAULT_MAYORISTA_DISCOUNT + DEFAULT_EMPRESARIO_EXTRA) * 100,
);
