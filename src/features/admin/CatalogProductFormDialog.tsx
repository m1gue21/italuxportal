import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CatalogCategory, CatalogProduct } from "@/features/catalog/types";
import { empresarioPrice, DEFAULT_PRICING, formatPrice } from "@/features/catalog/pricing";
import type { CatalogCurrency } from "@/features/catalog/catalog-meta";

const ALL_CATEGORIES: CatalogCategory[] = [
  "Cadenas",
  "Pulseras",
  "Dijes",
  "Combos",
  "Hombre",
  "Mujer",
];

export type CatalogProductFormValues = {
  handle: string;
  title: string;
  sku: string;
  retailPrice: number;
  compareAtPrice: number | null;
  mayoristaPrice: number;
  imageUrl: string;
  galleryText: string;
  tagsText: string;
  categories: CatalogCategory[];
  isActive: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: CatalogProduct | null;
  currency?: CatalogCurrency;
  locale?: string;
  onSubmit: (values: CatalogProductFormValues) => Promise<void>;
};

function toForm(p?: CatalogProduct | null): CatalogProductFormValues {
  return {
    handle: p?.handle ?? "",
    title: p?.title ?? "",
    sku: p?.sku ?? "",
    retailPrice: p?.retailPrice ?? 0,
    compareAtPrice: p?.compareAtPrice ?? null,
    mayoristaPrice: p?.mayoristaPrice ?? 0,
    imageUrl: p?.imageUrl ?? "",
    galleryText: (p?.galleryUrls ?? []).join("\n"),
    tagsText: (p?.tags ?? []).join(", "),
    categories: p?.categories ?? [],
    isActive: true,
  };
}

export function CatalogProductFormDialog({
  open,
  onOpenChange,
  initial,
  currency = "CLP",
  locale = "es-CL",
  onSubmit,
}: Props) {
  const editing = !!initial;
  const { register, handleSubmit, reset, watch, setValue } = useForm<CatalogProductFormValues>({
    defaultValues: toForm(initial),
  });

  useEffect(() => {
    if (open) reset(toForm(initial));
  }, [open, initial, reset]);

  const mayorista = watch("mayoristaPrice") || 0;
  const cats = watch("categories") || [];
  const empresario = empresarioPrice(
    { mayoristaPrice: Number(mayorista) || 0 },
    DEFAULT_PRICING,
    currency,
  );
  const money = (n: number) => formatPrice(n, currency, locale);

  const toggleCat = (c: CatalogCategory) => {
    const next = cats.includes(c) ? cats.filter((x) => x !== c) : [...cats, c];
    setValue("categories", next, { shouldDirty: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={handleSubmit(async (v) => {
            try {
              await onSubmit({
                ...v,
                retailPrice: Number(v.retailPrice),
                mayoristaPrice: Number(v.mayoristaPrice),
                compareAtPrice:
                  v.compareAtPrice == null || v.compareAtPrice === ("" as unknown as number)
                    ? null
                    : Number(v.compareAtPrice),
              });
              onOpenChange(false);
            } catch (e: unknown) {
              toast.error(e instanceof Error ? e.message : "No se pudo guardar");
            }
          })}
        >
          <div className="grid gap-1.5">
            <Label>Título</Label>
            <Input {...register("title", { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Handle</Label>
              <Input {...register("handle", { required: true })} disabled={editing} />
            </div>
            <div className="grid gap-1.5">
              <Label>SKU</Label>
              <Input {...register("sku")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Retail</Label>
              <Input type="number" step="any" {...register("retailPrice", { valueAsNumber: true })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Mayorista</Label>
              <Input
                type="number"
                step="any"
                {...register("mayoristaPrice", { valueAsNumber: true })}
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Empresario (auto −30% s/ mayorista):{" "}
            <span className="text-gold">{money(empresario)}</span>
          </p>
          <div className="grid gap-1.5">
            <Label>Imagen principal (URL Shopify)</Label>
            <Input {...register("imageUrl")} placeholder="https://cdn.shopify.com/..." />
          </div>
          <div className="grid gap-1.5">
            <Label>Galería (una URL por línea)</Label>
            <Textarea rows={4} {...register("galleryText")} placeholder="https://..." />
          </div>
          <div className="grid gap-1.5">
            <Label>Tags (separados por coma)</Label>
            <Input {...register("tagsText")} />
          </div>
          <div className="grid gap-1.5">
            <Label>Categorías</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCat(c)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider ${
                    cats.includes(c)
                      ? "border-gold/50 bg-gold/15 text-gold"
                      : "border-gold/20 text-muted-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
