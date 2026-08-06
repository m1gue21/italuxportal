export type InvestorRole = "mayorista" | "empresario";

export type CatalogCategory =
  | "Cadenas"
  | "Pulseras"
  | "Dijes"
  | "Combos"
  | "Hombre"
  | "Mujer";

export type CatalogProduct = {
  handle: string;
  title: string;
  sku: string;
  retailPrice: number;
  compareAtPrice: number | null;
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
