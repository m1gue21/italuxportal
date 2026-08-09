import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, ShoppingBag, X } from "lucide-react";
import logo from "@/assets/italux-logo.png";
import { Input } from "@/components/ui/input";
import { publicCountriesQuery } from "@/features/countries/queries";
import { SOCIAL_LINKS } from "@/features/countries/data";
import { getCatalogMeta } from "./catalog-meta";
import {
  getCatalogCategories,
  getCatalogProducts,
} from "./product-registry";
import {
  catalogByCodeQuery,
  categoriesForProducts,
  publicProductsQuery,
} from "./queries";
import { ProductCard } from "./ProductCard";
import { ProductDetailSheet } from "./ProductDetailSheet";
import { OrderSheet } from "./OrderSheet";
import { useOrderCart } from "./useOrderCart";
import type { CatalogCategory, CatalogProduct, InvestorRole } from "./types";
import {
  DEFAULT_PRICING,
  EMPRESARIO_PCT,
  type PricingConfig,
} from "./pricing";

type Props = {
  countryCode: string;
};

export function CatalogPage({ countryCode }: Props) {
  const meta = getCatalogMeta(countryCode);
  const { data: remoteCatalog } = useQuery(catalogByCodeQuery(countryCode));
  const {
    data: remoteProducts,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery(publicProductsQuery(countryCode));

  const packProducts = useMemo(() => getCatalogProducts(countryCode), [countryCode]);
  const products = useMemo(() => {
    if (remoteProducts && remoteProducts.length > 0) return remoteProducts;
    if (productsError || (remoteProducts && remoteProducts.length === 0)) {
      return packProducts;
    }
    return remoteProducts ?? packProducts;
  }, [remoteProducts, packProducts, productsError]);

  const categories = useMemo(() => {
    if (remoteProducts && remoteProducts.length > 0) {
      return categoriesForProducts(remoteProducts);
    }
    return getCatalogCategories(countryCode);
  }, [remoteProducts, countryCode]);

  const currency = remoteCatalog?.currency ?? meta?.currency ?? "CLP";
  const locale = remoteCatalog?.locale ?? meta?.locale ?? "es-CL";
  const countryName = remoteCatalog?.name ?? meta?.name ?? countryCode;
  const pricing: PricingConfig = {
    empresarioDiscount:
      remoteCatalog?.empresarioDiscount ?? DEFAULT_PRICING.empresarioDiscount,
  };

  const cart = useOrderCart(countryCode, pricing, currency);
  const { data: countries = [] } = useQuery(publicCountriesQuery);
  const countryRow = countries.find((c) => c.code === countryCode);
  const whatsappUrl = countryRow?.whatsapp_url || SOCIAL_LINKS.whatsapp;

  const productsByHandle = useMemo(
    () => new Map(products.map((p) => [p.handle, p])),
    [products],
  );

  const [detailProduct, setDetailProduct] = useState<CatalogProduct | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CatalogCategory | "all">("all");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (category !== "all" && !product.categories.includes(category)) {
        return false;
      }
      if (!deferredSearch) return true;
      const haystack = [
        product.title,
        product.sku,
        product.handle,
        ...product.tags,
        ...product.categories,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(deferredSearch);
    });
  }, [products, category, deferredSearch]);

  const setRole = (role: InvestorRole) => {
    cart.setRoleAndReprice(role, productsByHandle);
  };

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground antialiased">
      <header className="sticky top-0 z-40 border-b border-gold/15 bg-background/90 px-5 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Link
            to="/"
            hash="paises"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/25 text-gold"
            aria-label="Volver"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <img src={logo} alt="ITALUX" className="h-9 w-auto object-contain" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-gold">
              {countryName} · Inversionistas
            </p>
            <h1 className="font-display truncate text-lg leading-tight">
              {remoteCatalog?.title || "Catálogo Inversionistas"}
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 pt-5">
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Explora la colección ITALUX para mayoristas y empresarios. Arma tu pedido y envíalo por
          WhatsApp a un asesor.
        </p>

        <div className="mt-5 grid max-w-md grid-cols-2 gap-2 rounded-2xl border border-gold/20 bg-white/[0.02] p-1.5">
          {(
            [
              { id: "mayorista" as const, label: "Mayorista", hint: "precio lista" },
              {
                id: "empresario" as const,
                label: "Empresario",
                hint: `−${EMPRESARIO_PCT}% s/ mayorista`,
              },
            ] as const
          ).map((opt) => {
            const active = cart.role === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRole(opt.id)}
                className={`rounded-xl px-3 py-3 text-center transition-all ${
                  active
                    ? "bg-gold/15 text-gold shadow-[inset_0_0_0_1px] shadow-gold/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="block text-xs font-medium uppercase tracking-[0.18em]">
                  {opt.label}
                </span>
                <span className="mt-0.5 block text-[10px] opacity-80">{opt.hint}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span>
            <span className="line-through">Retail</span> tachado
          </span>
          <span>Mayorista (lista)</span>
          <span>Empresario −{EMPRESARIO_PCT}% s/ mayorista</span>
        </div>

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/70" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, SKU o categoría…"
            className="h-11 rounded-xl border-gold/25 bg-white/[0.03] pl-10 pr-10 text-sm placeholder:text-muted-foreground/70"
            aria-label="Buscar productos"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-all ${
              category === "all"
                ? "border-gold/50 bg-gold/15 text-gold"
                : "border-gold/20 text-muted-foreground hover:border-gold/40 hover:text-foreground"
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(active ? "all" : cat)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-all ${
                  active
                    ? "border-gold/50 bg-gold/15 text-gold"
                    : "border-gold/20 text-muted-foreground hover:border-gold/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground">
          {productsLoading
            ? "Cargando productos…"
            : `${filteredProducts.length} producto${filteredProducts.length === 1 ? "" : "s"}`}
          {category !== "all" ? ` · ${category}` : ""}
          {deferredSearch ? ` · “${search.trim()}”` : ""}
        </p>

        {filteredProducts.length === 0 && !productsLoading ? (
          <div className="mt-10 rounded-2xl border border-gold/15 bg-white/[0.02] px-6 py-12 text-center">
            <p className="font-display text-xl text-foreground">Sin resultados</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Prueba otra búsqueda o categoría.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.handle}
                product={product}
                role={cart.role}
                pricing={pricing}
                currency={currency}
                locale={locale}
                onOpen={() => setDetailProduct(product)}
                onQuickAdd={() => cart.addItem(product, 1, cart.role)}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOrderOpen(true)}
        className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-5 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-background shadow-lg shadow-black/40"
      >
        <ShoppingBag className="h-4 w-4" />
        Tu pedido ({cart.totalPieces})
      </button>

      <ProductDetailSheet
        product={detailProduct}
        open={!!detailProduct}
        onOpenChange={(o) => !o && setDetailProduct(null)}
        role={cart.role}
        pricing={pricing}
        currency={currency}
        locale={locale}
        countryLabel={countryName}
        onAdd={(p, qty) => cart.addItem(p, qty, cart.role)}
      />

      <OrderSheet
        open={orderOpen}
        onOpenChange={setOrderOpen}
        items={cart.items}
        role={cart.role}
        orderId={cart.orderId}
        customerName={cart.customerName}
        customerCity={cart.customerCity}
        totalAmount={cart.totalAmount}
        totalPieces={cart.totalPieces}
        whatsappUrl={whatsappUrl}
        countryName={countryName}
        currency={currency}
        locale={locale}
        onSetQty={cart.setQty}
        onRemove={cart.removeItem}
        onNameChange={cart.setCustomerName}
        onCityChange={cart.setCustomerCity}
        onClear={cart.clearOrder}
      />
    </div>
  );
}
