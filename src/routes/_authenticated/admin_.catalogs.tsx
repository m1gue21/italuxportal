import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  LogOut,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sheet,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useIsAdmin } from "@/features/admin/useIsAdmin";
import { AdminNav } from "@/features/admin/AdminNav";
import { CatalogProductFormDialog } from "@/features/admin/CatalogProductFormDialog";
import { CatalogBulkEditSheet } from "@/features/admin/CatalogBulkEditSheet";
import {
  loadCatalogDemoState,
  resetCatalogDemoState,
  saveCatalogDemoState,
  type CatalogDemoState,
  type ManagedCatalog,
} from "@/features/admin/catalog-local-store";
import type { CatalogProduct } from "@/features/catalog/types";
import {
  empresarioPct,
  empresarioPrice,
  formatClp,
  mayoristaPct,
  mayoristaPrice,
  type PricingConfig,
} from "@/features/catalog/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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

type Tab = "settings" | "products";

function CatalogsAdminPage() {
  const navigate = useNavigate();
  const { loading, isAdmin } = useIsAdmin();
  const [state, setState] = useState<CatalogDemoState | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("products");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CatalogProduct | null>(null);
  const [deleting, setDeleting] = useState<CatalogProduct | null>(null);
  const [selectedHandles, setSelectedHandles] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);

  useEffect(() => {
    setState(loadCatalogDemoState());
  }, []);

  useEffect(() => {
    setSelectedHandles(new Set());
    setBulkOpen(false);
  }, [selectedCode]);

  const persist = (next: CatalogDemoState) => {
    setState(next);
    saveCatalogDemoState(next);
  };

  const selected = state?.catalogs.find((c) => c.code === selectedCode) ?? null;
  const products = selected ? (state?.productsByCode[selected.code] ?? []) : [];

  const pricing: PricingConfig = useMemo(
    () => ({
      mayoristaDiscount: selected?.mayoristaDiscount ?? 0.3,
      empresarioExtra: selected?.empresarioExtra ?? 0.3,
    }),
    [selected?.mayoristaDiscount, selected?.empresarioExtra],
  );

  const filteredProducts = useMemo(() => {
    if (!deferredSearch) return products;
    return products.filter((p) => {
      const hay = [p.title, p.sku, p.handle, ...p.categories, ...p.tags].join(" ").toLowerCase();
      return hay.includes(deferredSearch);
    });
  }, [products, deferredSearch]);

  const updateCatalog = (
    code: string,
    patch: Partial<ManagedCatalog>,
    opts?: { toast?: boolean },
  ) => {
    if (!state) return;
    persist({
      ...state,
      catalogs: state.catalogs.map((c) => (c.code === code ? { ...c, ...patch } : c)),
    });
    if (opts?.toast) toast.success("Catálogo actualizado (demo local)");
  };

  const upsertProduct = (product: CatalogProduct) => {
    if (!state || !selected) return;
    const list = state.productsByCode[selected.code] ?? [];
    const idx = list.findIndex((p) => p.handle === product.handle);
    const nextList =
      idx >= 0 ? list.map((p, i) => (i === idx ? product : p)) : [product, ...list];
    persist({
      ...state,
      productsByCode: { ...state.productsByCode, [selected.code]: nextList },
    });
    toast.success(idx >= 0 ? "Producto guardado" : "Producto creado");
  };

  const removeProduct = (handle: string) => {
    if (!state || !selected) return;
    persist({
      ...state,
      productsByCode: {
        ...state.productsByCode,
        [selected.code]: (state.productsByCode[selected.code] ?? []).filter(
          (p) => p.handle !== handle,
        ),
      },
    });
    setSelectedHandles((prev) => {
      const next = new Set(prev);
      next.delete(handle);
      return next;
    });
    toast.success("Producto eliminado");
  };

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

  const applyBulkUpdates = (updated: CatalogProduct[]) => {
    if (!state || !selected) return;
    const map = new Map(updated.map((p) => [p.handle, p]));
    persist({
      ...state,
      productsByCode: {
        ...state.productsByCode,
        [selected.code]: (state.productsByCode[selected.code] ?? []).map(
          (p) => map.get(p.handle) ?? p,
        ),
      },
    });
    setSelectedHandles(new Set());
    toast.success(`${updated.length} productos actualizados`);
  };

  if (loading || !state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="w-full max-w-sm rounded-2xl border border-gold/20 bg-white/[0.02] p-6 text-center">
          <h1 className="font-display text-xl font-light">Acceso restringido</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-6 text-foreground">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-2">
          <div>
            <AdminNav current="/admin/catalogs" />
            <h1 className="font-display mt-1 text-2xl font-light tracking-wide">
              Gestionar catálogos
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                persist(resetCatalogDemoState());
                setSelectedCode(null);
                toast.message("Demo restablecida");
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate({ to: "/" })}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <p className="mt-2 text-xs text-muted-foreground">
          Vista previa del gestor (datos locales en este navegador). No escribe en Supabase.
        </p>

        {!selected ? (
          <section className="mt-5 space-y-2.5">
            {state.catalogs.map((catalog) => {
              const count = state.productsByCode[catalog.code]?.length ?? 0;
              const mPct = mayoristaPct({
                mayoristaDiscount: catalog.mayoristaDiscount,
                empresarioExtra: catalog.empresarioExtra,
              });
              const ePct = empresarioPct({
                mayoristaDiscount: catalog.mayoristaDiscount,
                empresarioExtra: catalog.empresarioExtra,
              });
              return (
                <article
                  key={catalog.code}
                  className="rounded-2xl border border-gold/15 bg-white/[0.02] px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-2xl" aria-hidden>
                      {catalog.flag}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-normal">{catalog.name}</h2>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
                            catalog.isActive
                              ? "bg-gold/15 text-gold"
                              : "bg-white/5 text-muted-foreground"
                          }`}
                        >
                          {catalog.isActive ? "Activo" : "Inactivo"}
                        </span>
                        {!catalog.hasProducts && (
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            Sin pack
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        /{catalog.slug}/catalogo · Mayorista −{mPct}% · Empresario −{ePct}% ·{" "}
                        <Package className="mr-0.5 inline h-3 w-3" />
                        {count} productos
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={catalog.isActive}
                        onCheckedChange={(v) =>
                          updateCatalog(catalog.code, { isActive: v }, { toast: true })
                        }
                      />
                      <Button size="sm" onClick={() => setSelectedCode(catalog.code)}>
                        Gestionar
                      </Button>
                      {catalog.code === "CL" && catalog.isActive && (
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/chile/catalogo" target="_blank">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="mt-5">
            <button
              type="button"
              onClick={() => {
                setSelectedCode(null);
                setSearch("");
                setTab("products");
              }}
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-gold/80 hover:text-gold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Todos los catálogos
            </button>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-normal">
                  <span className="mr-2">{selected.flag}</span>
                  {selected.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {selected.title} · /{selected.slug}/catalogo
                </p>
              </div>
              {selected.code === "CL" && (
                <Button size="sm" variant="outline" asChild>
                  <Link to="/chile/catalogo" target="_blank">
                    <ExternalLink className="mr-1 h-3.5 w-3.5" />
                    Ver público
                  </Link>
                </Button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-gold/20 bg-white/[0.02] p-1.5 sm:max-w-md">
              {(
                [
                  { id: "products" as const, label: "Productos" },
                  { id: "settings" as const, label: "Configuración" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTab(opt.id)}
                  className={`rounded-xl px-3 py-2.5 text-xs font-medium uppercase tracking-[0.16em] transition-all ${
                    tab === opt.id
                      ? "bg-gold/15 text-gold shadow-[inset_0_0_0_1px] shadow-gold/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {tab === "settings" ? (
              <div className="mt-5 space-y-4 rounded-2xl border border-gold/15 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between rounded-xl border border-gold/15 px-3 py-2">
                  <Label>Mostrar en landing</Label>
                  <Switch
                    checked={selected.isActive}
                    onCheckedChange={(v) =>
                      updateCatalog(selected.code, { isActive: v }, { toast: true })
                    }
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Título</Label>
                    <Input
                      value={selected.title}
                      onChange={(e) => updateCatalog(selected.code, { title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Texto del botón</Label>
                    <Input
                      value={selected.buttonLabel}
                      onChange={(e) =>
                        updateCatalog(selected.code, { buttonLabel: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug URL</Label>
                    <Input
                      value={selected.slug}
                      onChange={(e) =>
                        updateCatalog(selected.code, {
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Código país</Label>
                    <Input value={selected.code} disabled />
                  </div>
                  <div className="space-y-1.5">
                    <Label>% desc. mayorista (0–1)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={0.99}
                      value={selected.mayoristaDiscount}
                      onChange={(e) =>
                        updateCatalog(selected.code, {
                          mayoristaDiscount: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>% extra empresario (0–1)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={0.99}
                      value={selected.empresarioExtra}
                      onChange={(e) =>
                        updateCatalog(selected.code, {
                          empresarioExtra: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Demo local: Mayorista −{mayoristaPct(pricing)}% · Empresario −
                  {empresarioPct(pricing)}%. La tienda pública de Chile sigue usando los % del
                  código hasta conectar backend.
                </p>
              </div>
            ) : (
              <div className="mt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[200px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/70" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar producto…"
                      className="h-10 border-gold/25 bg-white/[0.03] pl-9"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={selectedHandles.size === 0}
                    onClick={() => setBulkOpen(true)}
                  >
                    <Sheet className="mr-1 h-3.5 w-3.5" />
                    Edición masiva
                    {selectedHandles.size > 0 ? ` (${selectedHandles.size})` : ""}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!selected.hasProducts && products.length === 0) {
                        persist({
                          ...state,
                          productsByCode: {
                            ...state.productsByCode,
                            [selected.code]: state.productsByCode[selected.code] ?? [],
                          },
                          catalogs: state.catalogs.map((c) =>
                            c.code === selected.code ? { ...c, hasProducts: true } : c,
                          ),
                        });
                      }
                      setCreating(true);
                    }}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Nuevo
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
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

                {products.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-gold/25 px-6 py-12 text-center">
                    <p className="font-display text-xl">Sin productos</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Este país aún no tiene pack de productos. Puedes crear algunos para probar el
                      flujo.
                    </p>
                    <Button className="mt-5" size="sm" onClick={() => setCreating(true)}>
                      <Plus className="mr-1 h-4 w-4" />
                      Agregar producto
                    </Button>
                  </div>
                ) : (
                  <ul className="mt-3 grid gap-2">
                    {filteredProducts.map((product) => {
                      const checked = selectedHandles.has(product.handle);
                      return (
                        <li
                          key={product.handle}
                          className={`flex gap-3 rounded-2xl border p-2.5 transition-colors ${
                            checked
                              ? "border-gold/40 bg-gold/5"
                              : "border-gold/15 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-start pt-1">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) =>
                                toggleHandle(product.handle, v === true)
                              }
                              className="border-gold/40"
                              aria-label={`Seleccionar ${product.title}`}
                            />
                          </div>
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{product.title}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {product.sku ? `SKU ${product.sku} · ` : ""}
                              Retail {formatClp(product.retailPrice)} · Mayorista{" "}
                              {formatClp(mayoristaPrice(product.retailPrice, pricing))} ·
                              Empresario{" "}
                              {formatClp(empresarioPrice(product.retailPrice, pricing))}
                            </p>
                            {product.categories.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {product.categories.map((cat) => (
                                  <span
                                    key={cat}
                                    className="rounded-full border border-gold/20 px-2 py-0.5 text-[10px] text-gold/90"
                                  >
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex shrink-0 items-start gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditing(product)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleting(product)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {(creating || editing) && selected && (
        <CatalogProductFormDialog
          open={creating || !!editing}
          onOpenChange={(open) => {
            if (!open) {
              setCreating(false);
              setEditing(null);
            }
          }}
          initial={editing}
          onSubmit={upsertProduct}
        />
      )}

      {selected && (
        <CatalogBulkEditSheet
          open={bulkOpen}
          onOpenChange={setBulkOpen}
          products={bulkProducts}
          pricing={pricing}
          onSave={applyBulkUpdates}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar “{deleting?.title}”? Solo afecta esta demo local.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) removeProduct(deleting.handle);
                setDeleting(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
