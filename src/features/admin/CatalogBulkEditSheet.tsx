import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CatalogCategory, CatalogProduct } from "@/features/catalog/types";
import { ALL_CATEGORIES } from "./catalog-local-store";
import {
  empresarioPrice,
  formatClp,
  mayoristaPrice,
  type PricingConfig,
} from "@/features/catalog/pricing";

export type BulkRowDraft = {
  handle: string;
  title: string;
  sku: string;
  retailPrice: string;
  compareAtPrice: string;
  imageUrl: string;
  categories: CatalogCategory[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: CatalogProduct[];
  pricing: PricingConfig;
  onSave: (updated: CatalogProduct[]) => void;
};

function toDraft(p: CatalogProduct): BulkRowDraft {
  return {
    handle: p.handle,
    title: p.title,
    sku: p.sku,
    retailPrice: String(p.retailPrice),
    compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : "",
    imageUrl: p.imageUrl,
    categories: [...p.categories],
  };
}

export function CatalogBulkEditSheet({
  open,
  onOpenChange,
  products,
  pricing,
  onSave,
}: Props) {
  const [rows, setRows] = useState<BulkRowDraft[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setRows(products.map(toDraft));
    setError("");
  }, [open, products]);

  const byHandle = useMemo(
    () => new Map(products.map((p) => [p.handle, p])),
    [products],
  );

  const updateRow = (handle: string, patch: Partial<BulkRowDraft>) => {
    setRows((prev) => prev.map((r) => (r.handle === handle ? { ...r, ...patch } : r)));
  };

  const toggleCategory = (handle: string, cat: CatalogCategory) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.handle !== handle) return r;
        const has = r.categories.includes(cat);
        return {
          ...r,
          categories: has
            ? r.categories.filter((c) => c !== cat)
            : [...r.categories, cat],
        };
      }),
    );
  };

  const applyCategoryToAll = (cat: CatalogCategory, mode: "add" | "remove") => {
    setRows((prev) =>
      prev.map((r) => {
        const has = r.categories.includes(cat);
        if (mode === "add" && !has) return { ...r, categories: [...r.categories, cat] };
        if (mode === "remove" && has) {
          return { ...r, categories: r.categories.filter((c) => c !== cat) };
        }
        return r;
      }),
    );
  };

  const applyPricePctToAll = (field: "retailPrice" | "compareAtPrice", pct: number) => {
    setRows((prev) =>
      prev.map((r) => {
        const current = Number(r[field]);
        if (!Number.isFinite(current) || current <= 0) return r;
        return { ...r, [field]: String(Math.round(current * (1 + pct / 100))) };
      }),
    );
  };

  const handleSave = () => {
    const updated: CatalogProduct[] = [];
    for (const row of rows) {
      const base = byHandle.get(row.handle);
      if (!base) continue;
      const retail = Number(row.retailPrice);
      if (!row.title.trim()) {
        setError(`Falta título en ${row.handle}`);
        return;
      }
      if (!Number.isFinite(retail) || retail <= 0) {
        setError(`Precio inválido en “${row.title || row.handle}”`);
        return;
      }
      const compare = row.compareAtPrice.trim() ? Number(row.compareAtPrice) : null;
      if (compare != null && (!Number.isFinite(compare) || compare < 0)) {
        setError(`Compare-at inválido en “${row.title}”`);
        return;
      }
      const imageUrl = row.imageUrl.trim();
      const gallery =
        base.galleryUrls.length > 0
          ? base.galleryUrls.map((u, i) => (i === 0 && imageUrl ? imageUrl : u))
          : imageUrl
            ? [imageUrl]
            : [];

      updated.push({
        ...base,
        title: row.title.trim(),
        sku: row.sku.trim(),
        retailPrice: Math.round(retail),
        compareAtPrice: compare != null ? Math.round(compare) : null,
        imageUrl: imageUrl || gallery[0] || "",
        galleryUrls: gallery,
        categories: row.categories,
      });
    }
    onSave(updated);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] w-[calc(100%-1rem)] max-w-6xl flex-col gap-0 overflow-hidden border-gold/20 bg-background p-0 sm:rounded-2xl">
        <DialogHeader className="shrink-0 border-b border-gold/15 px-5 py-4 text-left">
          <DialogTitle className="font-display text-2xl font-normal">
            Edición masiva
          </DialogTitle>
          <DialogDescription className="text-xs">
            {rows.length} producto{rows.length === 1 ? "" : "s"} · edita como una hoja y guarda
            cuando termines
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 space-y-2 border-b border-gold/10 px-5 py-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-gold/80">
            Acciones rápidas (todas las filas)
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => applyPricePctToAll("retailPrice", 10)}
            >
              Retail +10%
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => applyPricePctToAll("retailPrice", -10)}
            >
              Retail −10%
            </Button>
            {ALL_CATEGORIES.slice(0, 4).map((cat) => (
              <Button
                key={`add-${cat}`}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => applyCategoryToAll(cat, "add")}
              >
                + {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-2 pb-2 sm:px-4">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
              <TableRow className="border-gold/20 hover:bg-transparent">
                <TableHead className="w-14 min-w-14">Img</TableHead>
                <TableHead className="min-w-[200px]">Título</TableHead>
                <TableHead className="min-w-[110px]">SKU</TableHead>
                <TableHead className="min-w-[110px]">Retail</TableHead>
                <TableHead className="min-w-[110px]">Compare</TableHead>
                <TableHead className="min-w-[120px]">Mayorista*</TableHead>
                <TableHead className="min-w-[120px]">Empresario*</TableHead>
                <TableHead className="min-w-[220px]">Imagen URL</TableHead>
                <TableHead className="min-w-[280px]">Categorías</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const retailNum = Number(row.retailPrice);
                const retailOk = Number.isFinite(retailNum) && retailNum > 0;
                return (
                  <TableRow key={row.handle} className="border-gold/10">
                    <TableCell>
                      <div className="h-10 w-10 overflow-hidden rounded-md border border-gold/15 bg-white/[0.03]">
                        {row.imageUrl ? (
                          <img
                            src={row.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.title}
                        onChange={(e) => updateRow(row.handle, { title: e.target.value })}
                        className="h-8 border-gold/20 bg-transparent text-xs"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.sku}
                        onChange={(e) => updateRow(row.handle, { sku: e.target.value })}
                        className="h-8 border-gold/20 bg-transparent text-xs"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.retailPrice}
                        onChange={(e) =>
                          updateRow(row.handle, { retailPrice: e.target.value })
                        }
                        className="h-8 border-gold/20 bg-transparent text-xs tabular-nums"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.compareAtPrice}
                        onChange={(e) =>
                          updateRow(row.handle, { compareAtPrice: e.target.value })
                        }
                        className="h-8 border-gold/20 bg-transparent text-xs tabular-nums"
                      />
                    </TableCell>
                    <TableCell className="text-xs tabular-nums text-muted-foreground">
                      {retailOk ? formatClp(mayoristaPrice(retailNum, pricing)) : "—"}
                    </TableCell>
                    <TableCell className="text-xs tabular-nums text-muted-foreground">
                      {retailOk ? formatClp(empresarioPrice(retailNum, pricing)) : "—"}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.imageUrl}
                        onChange={(e) => updateRow(row.handle, { imageUrl: e.target.value })}
                        className="h-8 border-gold/20 bg-transparent text-xs"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {ALL_CATEGORIES.map((cat) => {
                          const checked = row.categories.includes(cat);
                          return (
                            <label
                              key={cat}
                              className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${
                                checked
                                  ? "border-gold/40 bg-gold/10 text-gold"
                                  : "border-gold/15 text-muted-foreground"
                              }`}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleCategory(row.handle, cat)}
                                className="h-3 w-3 border-gold/40"
                              />
                              {cat}
                            </label>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <p className="mt-2 px-2 text-[10px] text-muted-foreground">
            * Mayorista / Empresario se recalculan según los descuentos del catálogo (solo lectura).
          </p>
        </div>

        <div className="shrink-0 space-y-2 border-t border-gold/15 px-5 py-4">
          {error && <p className="text-[11px] text-destructive">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave}>
              Guardar {rows.length} cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
