import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeferredValue, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Package, Search } from "lucide-react";

import { AdminNav } from "@/features/admin/AdminNav";
import { CmsStaticNotice } from "@/features/admin/CmsStaticNotice";
import { CATALOG_COUNTRIES } from "@/features/catalog/catalog-meta";
import { getCatalogProducts } from "@/features/catalog/product-registry";
import {
  DEFAULT_PRICING,
  empresarioPct,
  empresarioPrice,
  formatPrice,
  mayoristaPrice,
} from "@/features/catalog/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin_/catalogs")({
  component: CatalogsAdminPage,
});

const PACK_FILE: Record<string, string> = {
  CL: "src/features/catalog/chile-products.ts",
  CO: "src/features/catalog/colombia-products.ts",
  EC: "src/features/catalog/ecuador-products.ts",
  ES: "src/features/catalog/spain-products.ts",
};

function CatalogsAdminPage() {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const catalogs = CATALOG_COUNTRIES.filter((c) => getCatalogProducts(c.code).length > 0);
  const selected = catalogs.find((c) => c.code === selectedCode) ?? null;
  const products = useMemo(() => (selected ? getCatalogProducts(selected.code) : []), [selected]);

  const currency = selected?.currency ?? "CLP";
  const locale = selected?.locale ?? "es-CL";
  const money = (n: number) => formatPrice(n, currency, locale);
  const pricing = DEFAULT_PRICING;
  const ePct = empresarioPct(pricing);

  const filteredProducts = useMemo(() => {
    if (!deferredSearch) return products;
    return products.filter((p) => {
      const hay = [p.title, p.sku, p.handle, ...p.categories, ...p.tags].join(" ").toLowerCase();
      return hay.includes(deferredSearch);
    });
  }, [products, deferredSearch]);

  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-6 text-foreground">
      <div className="mx-auto max-w-4xl">
        <header>
          <AdminNav current="/admin/catalogs" />
          <h1 className="font-display mt-1 text-2xl font-light tracking-wide">Catálogos</h1>
        </header>

        <CmsStaticNotice
          filePath={
            selected
              ? (PACK_FILE[selected.code] ?? "src/features/catalog/")
              : "src/features/catalog/*-products.ts"
          }
        />

        <p className="mt-2 text-xs text-muted-foreground">
          El mayorista viene del pack; el empresario se calcula (−{ePct}% sobre mayorista). Imágenes
          = URLs Shopify.
        </p>

        {!selected ? (
          <section className="mt-5 space-y-2.5">
            {catalogs.map((catalog) => (
              <article
                key={catalog.code}
                className="rounded-2xl border border-gold/15 bg-surface px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-2xl" aria-hidden>
                    {catalog.flag}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-lg font-normal">{catalog.name}</h2>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      /{catalog.slug}/catalogo · <Package className="mr-0.5 inline h-3 w-3" />
                      {getCatalogProducts(catalog.code).length} productos
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setSelectedCode(catalog.code)}>
                    Ver productos
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/$slug/catalogo" params={{ slug: catalog.slug }} target="_blank">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedCode(null)}>
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Volver
              </Button>
              <span className="text-2xl" aria-hidden>
                {selected.flag}
              </span>
              <h2 className="font-display text-lg font-normal">{selected.name}</h2>
              <span className="text-[11px] text-muted-foreground">{products.length} productos</span>
            </div>

            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar…"
                className="pl-9"
              />
            </div>

            <p className="mb-3 text-[11px] text-muted-foreground">
              {filteredProducts.length} de {products.length} productos
            </p>

            <ul className="grid gap-2">
              {filteredProducts.map((p) => (
                <li
                  key={p.handle}
                  className="flex items-start gap-3 rounded-xl border border-gold/15 bg-surface p-3"
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-strong text-[10px] text-muted-foreground">
                      N/A
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {p.sku || p.handle}
                      {p.mayoristaMatch ? ` · ${p.mayoristaMatch}` : ""}
                      {p.mayoristaIsProvisional ? " · provisional" : ""}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Retail {money(p.retailPrice)} · Mayorista {money(mayoristaPrice(p))} ·
                      Empresario {money(empresarioPrice(p, pricing))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
