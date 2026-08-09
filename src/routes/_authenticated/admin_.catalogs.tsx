import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  LogOut,
  Package,
  Pencil,
  Plus,
  Search,
  Sheet,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AdminNav } from "@/features/admin/AdminNav";
import { CatalogBulkEditSheet } from "@/features/admin/CatalogBulkEditSheet";
import {
  CatalogProductFormDialog,
  type CatalogProductFormValues,
} from "@/features/admin/CatalogProductFormDialog";
import { supabase } from "@/integrations/supabase/client";
import {
  adminCatalogsQuery,
  adminProductsQuery,
} from "@/features/catalog/queries";
import type { CatalogProduct } from "@/features/catalog/types";
import {
  DEFAULT_PRICING,
  empresarioPct,
  empresarioPrice,
  formatPrice,
  mayoristaPrice,
} from "@/features/catalog/pricing";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/admin_/catalogs")({
  component: CatalogsAdminPage,
});

function CatalogsAdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: catalogs = [], isLoading: catalogsLoading } = useQuery(adminCatalogsQuery);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [editing, setEditing] = useState<CatalogProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<CatalogProduct | null>(null);
  const [selectedHandles, setSelectedHandles] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);

  useEffect(() => {
    setSelectedHandles(new Set());
    setBulkOpen(false);
  }, [selectedCode]);

  const selected = catalogs.find((c) => c.code === selectedCode) ?? null;
  const { data: products = [], isLoading: productsLoading } = useQuery({
    ...adminProductsQuery(selectedCode ?? ""),
    enabled: !!selectedCode,
  });

  const currency = selected?.currency ?? "CLP";
  const locale = selected?.locale ?? "es-CL";
  const money = (n: number) => formatPrice(n, currency, locale);
  const pricing = {
    empresarioDiscount:
      selected?.empresarioDiscount ?? DEFAULT_PRICING.empresarioDiscount,
  };
  const ePct = empresarioPct(pricing);

  const filteredProducts = useMemo(() => {
    if (!deferredSearch) return products;
    return products.filter((p) => {
      const hay = [p.title, p.sku, p.handle, ...p.categories, ...p.tags]
        .join(" ")
        .toLowerCase();
      return hay.includes(deferredSearch);
    });
  }, [products, deferredSearch]);

  const bulkProducts = useMemo(
    () => products.filter((p) => selectedHandles.has(p.handle)),
    [products, selectedHandles],
  );

  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedHandles.has(p.handle));

  const toggleHandle = (handle: string, checked: boolean) => {
    setSelectedHandles((prev) => {
      const next = new Set(prev);
      if (checked) next.add(handle);
      else next.delete(handle);
      return next;
    });
  };

  const toggleSelectAllFiltered = (checked: boolean) => {
    setSelectedHandles((prev) => {
      const next = new Set(prev);
      for (const p of filteredProducts) {
        if (checked) next.add(p.handle);
        else next.delete(p.handle);
      }
      return next;
    });
  };

  const invalidate = () => {
    if (selectedCode) {
      void qc.invalidateQueries({ queryKey: ["investor_products", "admin", selectedCode] });
      void qc.invalidateQueries({ queryKey: ["investor_products", "public", selectedCode] });
    }
    void qc.invalidateQueries({ queryKey: ["investor_catalogs"] });
  };

  const saveMut = useMutation({
    mutationFn: async ({
      values,
      existing,
    }: {
      values: CatalogProductFormValues;
      existing: CatalogProduct | null;
    }) => {
      if (!selectedCode) throw new Error("Sin catálogo");
      const gallery_urls = values.galleryText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const tags = values.tagsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        catalog_code: selectedCode,
        handle: values.handle.trim(),
        title: values.title.trim(),
        sku: values.sku.trim(),
        retail_price: values.retailPrice,
        compare_at_price: values.compareAtPrice,
        mayorista_price: values.mayoristaPrice,
        mayorista_is_provisional: false,
        mayorista_match: "manual" as const,
        image_url: values.imageUrl.trim(),
        gallery_urls,
        tags,
        categories: values.categories,
        is_active: values.isActive,
      };

      if (existing) {
        const { error } = await supabase
          .from("investor_products")
          .update(payload)
          .eq("catalog_code", selectedCode)
          .eq("handle", existing.handle);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("investor_products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Producto guardado");
      invalidate();
      setEditing(null);
      setCreating(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (product: CatalogProduct) => {
      if (!selectedCode) throw new Error("Sin catálogo");
      const { error } = await supabase
        .from("investor_products")
        .delete()
        .eq("catalog_code", selectedCode)
        .eq("handle", product.handle);
      if (error) throw error;
    },
    onSuccess: (_data, product) => {
      toast.success("Producto eliminado");
      invalidate();
      setDeleting(null);
      setSelectedHandles((prev) => {
        const next = new Set(prev);
        next.delete(product.handle);
        return next;
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkSaveMut = useMutation({
    mutationFn: async (updated: CatalogProduct[]) => {
      if (!selectedCode) throw new Error("Sin catálogo");
      await Promise.all(
        updated.map(async (p) => {
          const { error } = await supabase
            .from("investor_products")
            .update({
              title: p.title,
              sku: p.sku,
              retail_price: p.retailPrice,
              compare_at_price: p.compareAtPrice,
              mayorista_price: p.mayoristaPrice,
              mayorista_is_provisional: false,
              mayorista_match: "manual" as const,
              image_url: p.imageUrl,
              gallery_urls: p.galleryUrls,
              categories: p.categories,
            })
            .eq("catalog_code", selectedCode)
            .eq("handle", p.handle);
          if (error) throw error;
        }),
      );
      return updated.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} productos actualizados`);
      invalidate();
      setSelectedHandles(new Set());
      setBulkOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-6 text-foreground">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-2">
          <div>
            <AdminNav current="/admin/catalogs" />
            <h1 className="font-display mt-1 text-2xl font-light tracking-wide">
              Catálogos
            </h1>
          </div>
          <Button size="sm" variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <p className="mt-2 rounded-lg border border-gold/20 bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground">
          Edición en vivo en Supabase. El mayorista se guarda a mano; el empresario se calcula
          (−{ePct}% sobre mayorista). Imágenes = URLs Shopify.
        </p>

        {!selected ? (
          <section className="mt-5 space-y-2.5">
            {catalogsLoading ? (
              <p className="text-sm text-muted-foreground">Cargando catálogos…</p>
            ) : catalogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay catálogos. Corre <code className="text-gold">npm run seed:catalogs</code>.
              </p>
            ) : (
              catalogs.map((catalog) => (
                <article
                  key={catalog.code}
                  className="rounded-2xl border border-gold/15 bg-white/[0.02] px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-2xl" aria-hidden>
                      {catalog.flag}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-lg font-normal">{catalog.name}</h2>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        /{catalog.slug}/catalogo ·{" "}
                        <Package className="mr-0.5 inline h-3 w-3" />
                        {catalog.isActive ? "Activo" : "Inactivo"}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => setSelectedCode(catalog.code)}>
                      Gestionar
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        to="/$slug/catalogo"
                        params={{ slug: catalog.slug }}
                        target="_blank"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))
            )}
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
              <span className="text-[11px] text-muted-foreground">
                {productsLoading ? "…" : `${products.length} productos`}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                disabled={selectedHandles.size === 0}
                onClick={() => setBulkOpen(true)}
              >
                <Sheet className="mr-1 h-3.5 w-3.5" />
                Edición masiva
                {selectedHandles.size > 0 ? ` (${selectedHandles.size})` : ""}
              </Button>
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Nuevo
              </Button>
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

            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">
                {filteredProducts.length} de {products.length} productos
                {selectedHandles.size > 0
                  ? ` · ${selectedHandles.size} seleccionados`
                  : ""}
              </p>
              {filteredProducts.length > 0 && (
                <label className="inline-flex cursor-pointer items-center gap-2 text-[11px] text-muted-foreground">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={(v) => toggleSelectAllFiltered(v === true)}
                    className="border-gold/40"
                  />
                  Seleccionar visibles
                </label>
              )}
            </div>

            <ul className="grid gap-2">
              {filteredProducts.map((p) => {
                const checked = selectedHandles.has(p.handle);
                return (
                  <li
                    key={p.handle}
                    className={`flex items-start gap-3 rounded-xl border bg-white/[0.02] p-3 ${
                      checked ? "border-gold/40" : "border-gold/15"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => toggleHandle(p.handle, v === true)}
                      className="mt-1 border-gold/40"
                      aria-label={`Seleccionar ${p.title}`}
                    />
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white/5 text-[10px] text-muted-foreground">
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
                    <button
                      type="button"
                      className="rounded-md p-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setEditing(p)}
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-md p-2 text-destructive/80 hover:text-destructive"
                      onClick={() => setDeleting(p)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      {(creating || editing) && (
        <CatalogProductFormDialog
          open={creating || !!editing}
          onOpenChange={(o) => {
            if (!o) {
              setCreating(false);
              setEditing(null);
            }
          }}
          initial={editing}
          currency={currency}
          locale={locale}
          onSubmit={async (values) => {
            await saveMut.mutateAsync({ values, existing: editing });
          }}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar “{deleting?.title}”? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) deleteMut.mutate(deleting);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {bulkOpen && (
        <CatalogBulkEditSheet
          open={bulkOpen}
          onOpenChange={setBulkOpen}
          products={bulkProducts}
          pricing={pricing}
          currency={currency}
          locale={locale}
          onSave={async (updated) => {
            await bulkSaveMut.mutateAsync(updated);
          }}
        />
      )}
    </main>
  );
}
