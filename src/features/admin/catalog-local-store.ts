import { CHILE_PRODUCTS, CATALOG_CATEGORIES } from "@/features/catalog/chile-products";
import type { CatalogCategory, CatalogProduct } from "@/features/catalog/types";
import {
  DEFAULT_EMPRESARIO_EXTRA,
  DEFAULT_MAYORISTA_DISCOUNT,
} from "@/features/catalog/pricing";

const STORAGE_KEY = "italux-admin-catalogs-demo";

export type ManagedCatalog = {
  code: string;
  name: string;
  flag: string;
  slug: string;
  title: string;
  buttonLabel: string;
  isActive: boolean;
  mayoristaDiscount: number;
  empresarioExtra: number;
  /** Has a product pack available in code */
  hasProducts: boolean;
};

export type CatalogDemoState = {
  catalogs: ManagedCatalog[];
  productsByCode: Record<string, CatalogProduct[]>;
};

const DEFAULT_CATALOGS: ManagedCatalog[] = [
  {
    code: "CL",
    name: "Chile",
    flag: "🇨🇱",
    slug: "chile",
    title: "Catálogo Inversionistas",
    buttonLabel: "Catálogo Inversionistas",
    isActive: true,
    mayoristaDiscount: DEFAULT_MAYORISTA_DISCOUNT,
    empresarioExtra: DEFAULT_EMPRESARIO_EXTRA,
    hasProducts: true,
  },
  {
    code: "CO",
    name: "Colombia",
    flag: "🇨🇴",
    slug: "colombia",
    title: "Catálogo Inversionistas",
    buttonLabel: "Catálogo Inversionistas",
    isActive: false,
    mayoristaDiscount: DEFAULT_MAYORISTA_DISCOUNT,
    empresarioExtra: DEFAULT_EMPRESARIO_EXTRA,
    hasProducts: false,
  },
  {
    code: "MX",
    name: "México",
    flag: "🇲🇽",
    slug: "mexico",
    title: "Catálogo Inversionistas",
    buttonLabel: "Catálogo Inversionistas",
    isActive: false,
    mayoristaDiscount: DEFAULT_MAYORISTA_DISCOUNT,
    empresarioExtra: DEFAULT_EMPRESARIO_EXTRA,
    hasProducts: false,
  },
  {
    code: "PE",
    name: "Perú",
    flag: "🇵🇪",
    slug: "peru",
    title: "Catálogo Inversionistas",
    buttonLabel: "Catálogo Inversionistas",
    isActive: false,
    mayoristaDiscount: DEFAULT_MAYORISTA_DISCOUNT,
    empresarioExtra: DEFAULT_EMPRESARIO_EXTRA,
    hasProducts: false,
  },
];

function defaultState(): CatalogDemoState {
  return {
    catalogs: DEFAULT_CATALOGS.map((c) => ({ ...c })),
    productsByCode: {
      CL: CHILE_PRODUCTS.map((p) => ({
        ...p,
        galleryUrls: [...p.galleryUrls],
        tags: [...p.tags],
        categories: [...p.categories],
      })),
    },
  };
}

export function loadCatalogDemoState(): CatalogDemoState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<CatalogDemoState>;
    const base = defaultState();
    return {
      catalogs: Array.isArray(parsed.catalogs) ? parsed.catalogs : base.catalogs,
      productsByCode: {
        ...base.productsByCode,
        ...(parsed.productsByCode ?? {}),
      },
    };
  } catch {
    return defaultState();
  }
}

export function saveCatalogDemoState(state: CatalogDemoState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetCatalogDemoState(): CatalogDemoState {
  const state = defaultState();
  saveCatalogDemoState(state);
  return state;
}

export const ALL_CATEGORIES: CatalogCategory[] = [...CATALOG_CATEGORIES];

export function slugifyHandle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
