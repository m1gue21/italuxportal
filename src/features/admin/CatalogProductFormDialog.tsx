import { useEffect, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { CatalogCategory, CatalogProduct } from "@/features/catalog/types";
import { ALL_CATEGORIES, slugifyHandle } from "./catalog-local-store";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: CatalogProduct | null;
  onSubmit: (product: CatalogProduct) => void;
};

export function CatalogProductFormDialog({ open, onOpenChange, initial, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setSku(initial?.sku ?? "");
    setRetailPrice(initial ? String(initial.retailPrice) : "");
    setCompareAtPrice(initial?.compareAtPrice != null ? String(initial.compareAtPrice) : "");
    setImageUrl(initial?.imageUrl ?? "");
    setCategories(initial?.categories ?? []);
    setError("");
  }, [open, initial]);

  const toggleCategory = (cat: CatalogCategory) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(retailPrice);
    if (!title.trim()) {
      setError("El título es obligatorio");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Precio retail inválido");
      return;
    }
    const compare = compareAtPrice.trim() ? Number(compareAtPrice) : null;
    if (compare != null && (!Number.isFinite(compare) || compare < 0)) {
      setError("Compare-at inválido");
      return;
    }

    const handle = initial?.handle || slugifyHandle(title) || `producto-${Date.now()}`;
    const gallery = initial?.galleryUrls?.length
      ? initial.galleryUrls.map((u, i) => (i === 0 && imageUrl.trim() ? imageUrl.trim() : u))
      : imageUrl.trim()
        ? [imageUrl.trim()]
        : [];

    onSubmit({
      handle,
      title: title.trim(),
      sku: sku.trim(),
      retailPrice: Math.round(price),
      compareAtPrice: compare != null ? Math.round(compare) : null,
      imageUrl: imageUrl.trim() || gallery[0] || "",
      galleryUrls: gallery.length ? gallery : imageUrl.trim() ? [imageUrl.trim()] : [],
      tags: initial?.tags ?? [],
      categories,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-gold/20 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">
            {initial ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 space-y-4">
          <Field label="Título">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="SKU">
              <Input value={sku} onChange={(e) => setSku(e.target.value)} />
            </Field>
            <Field label="Precio retail (CLP)">
              <Input
                type="number"
                min={0}
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Compare at (opcional)">
            <Input
              type="number"
              min={0}
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
            />
          </Field>
          <Field label="URL imagen principal">
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://cdn.shopify.com/..."
            />
          </Field>
          {imageUrl && (
            <div className="h-28 w-28 overflow-hidden rounded-xl border border-gold/20">
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
          )}

          <div className="space-y-2">
            <Label>Categorías</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const active = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em] ${
                      active
                        ? "border-gold/50 bg-gold/15 text-gold"
                        : "border-gold/20 text-muted-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-[11px] text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{initial ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
