import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, ShoppingBag, X } from "lucide-react";
import logo from "@/assets/italux-logo.png.asset.json";
import { Input } from "@/components/ui/input";
import { publicCountriesQuery } from "@/features/countries/queries";
import { SOCIAL_LINKS } from "@/features/countries/data";
import { CATALOG_CATEGORIES, CHILE_PRODUCTS } from "./chile-products";
import { ProductCard } from "./ProductCard";
import { ProductDetailSheet } from "./ProductDetailSheet";
import { OrderSheet } from "./OrderSheet";
import { useOrderCart } from "./useOrderCart";
import type { CatalogCategory, CatalogProduct, InvestorRole } from "./types";
import { EMPRESARIO_PCT, MAYORISTA_PCT } from "./pricing";

export function CatalogPage() {
  const cart = useOrderCart("CL");
  const { data: countries = [] } = useQuery(publicCountriesQuery);
  const chile = countries.find((c) => c.code === "CL");
  const whatsappUrl = chile?.whatsapp_url || SOCIAL_LINKS.whatsapp;

  const productsByHandle = useMemo(
    () => new Map(CHILE_PRODUCTS.map((p) => [p.handle, p])),
    [],
  );

  const [detailProduct, setDetailProduct] = useState<CatalogProduct | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CatalogCategory | "all">("all");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const filteredProducts = useMemo(() => {
    return CHILE_PRODUCTS.filter((product) => {
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
  }, [category, deferredSearch]);

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
          <img src={logo.url} alt="ITALUX" className="h-9 w-auto object-contain" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-gold">
              Chile · Inversionistas
            </p>
            <h1 className="font-display truncate text-lg leading-tight">Catálogo Inversionistas</h1>
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
              { id: "mayorista" as const, label: "Mayorista", pct: MAYORISTA_PCT },
              { id: "empresario" as const, label: "Empresario", pct: EMPRESARIO_PCT },
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
                <span className="mt-0.5 block text-[10px] opacity-80">−{opt.pct}% retail</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span>
            <span className="line-through">Retail</span> tachado
          </span>
          <span>Mayorista −{MAYORISTA_PCT}%</span>
          <span>Empresario −{EMPRESARIO_PCT}%</span>
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
          {CATALOG_CATEGORIES.map((cat) => {
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
          {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"}
          {category !== "all" ? ` · ${category}` : ""}
          {deferredSearch ? ` · “${search.trim()}”` : ""}
        </p>

        {filteredProducts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-gold/15 bg-white/[0.02] px-6 py-12 text-center">
            <p className="font-display text-xl text-foreground">Sin resultados</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Prueba otra búsqueda o categoría.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
              className="mt-5 text-xs uppercase tracking-[0.2em] text-gold hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.handle}
                product={product}
                role={cart.role}
                onOpen={() => setDetailProduct(product)}
                onQuickAdd={() => cart.addItem(product, 1, cart.role)}
              />
            ))}
          </div>
        )}
      </div>

      {cart.totalPieces > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-5 pb-5 pt-2">
          <button
            type="button"
            onClick={() => setOrderOpen(true)}
            className="mx-auto flex w-full max-w-md items-center justify-between gap-3 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-5 py-4 text-background shadow-[0_12px_40px_-12px] shadow-gold/50 active:scale-[0.98] md:max-w-sm"
          >
            <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em]">
              <ShoppingBag className="h-4 w-4" />
              Ver pedido ({cart.totalPieces})
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
                maximumFractionDigits: 0,
              }).format(cart.totalAmount)}
            </span>
          </button>
        </div>
      )}

      <ProductDetailSheet
        product={detailProduct}
        open={!!detailProduct}
        onOpenChange={(open) => {
          if (!open) setDetailProduct(null);
        }}
        role={cart.role}
        countryLabel="ITALUX Chile"
        onAdd={(product, qty) => cart.addItem(product, qty, cart.role)}
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
        countryName="Chile"
        onSetQty={cart.setQty}
        onRemove={cart.removeItem}
        onNameChange={cart.setCustomerName}
        onCityChange={cart.setCustomerCity}
        onClear={cart.clearOrder}
      />
    </div>
  );
}
