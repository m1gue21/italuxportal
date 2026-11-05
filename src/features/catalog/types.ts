export type InvestorRole = "mayorista" | "empresario";

export type CatalogCategory = "Cadenas" | "Pulseras" | "Dijes" | "Combos" | "Hombre" | "Mujer";

export type MayoristaMatch =
  "sku" | "name" | "estimate" | "estimate_family" | "fallback" | "manual";

export type CatalogProduct = {
  handle: string;
  title: string;
  sku: string;
  retailPrice: number;
  compareAtPrice: number | null;
  /** Precio mayorista (manual o seed). Source of truth del rol mayorista. */
  mayoristaPrice: number;
  /** Precio empresario de la tabla del país. Si falta, se calcula sobre el mayorista. */
  empresarioPrice?: number;
  mayoristaIsProvisional?: boolean;
  mayoristaMatch?: MayoristaMatch | null;
  imageUrl: string;
  galleryUrls: string[];
  tags: string[];
  categories: CatalogCategory[];
};

export type OrderLine = {
  handle: string;
  title: string;
  sku: string;
  imageUrl: string;
  qty: number;
  unitPrice: number;
  role: InvestorRole;
};

export type OrderState = {
  role: InvestorRole;
  items: OrderLine[];
  orderId: string;
  customerName: string;
  customerCity: string;
};
