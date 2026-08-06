import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CatalogProduct, InvestorRole } from "./types";
import {
  DEFAULT_PRICING,
  empresarioPct,
  empresarioPrice,
  formatClp,
  mayoristaPct,
  mayoristaPrice,
  priceForRole,
  type PricingConfig,
} from "./pricing";

type Props = {
  product: CatalogProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: InvestorRole;
  pricing?: PricingConfig;
  countryLabel?: string;
  onAdd: (product: CatalogProduct, qty: number) => void;
};

export function ProductDetailSheet({
  product,
  open,
  onOpenChange,
  role,
  pricing = DEFAULT_PRICING,
  countryLabel = "ITALUX",
  onAdd,
}: Props) {
  const [qty, setQty] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (open && product) {
      setQty(1);
      setImgIndex(0);
    }
  }, [open, product?.handle]);

  if (!product) return null;

  const gallery = product.galleryUrls?.length
    ? product.galleryUrls
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  const unit = priceForRole(product.retailPrice, role, pricing);
  const mPct = mayoristaPct(pricing);
  const ePct = empresarioPct(pricing);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(92vh,880px)] w-[calc(100%-1.5rem)] max-w-3xl gap-0 overflow-hidden border-gold/20 bg-background p-0 sm:rounded-2xl">
        <div className="grid max-h-[min(92vh,880px)] md:grid-cols-2">
          <div className="min-h-0 overflow-y-auto border-b border-gold/10 p-4 sm:p-5 md:border-b-0 md:border-r">
            <div className="mx-auto aspect-square max-h-[42vh] overflow-hidden rounded-2xl border border-gold/15 bg-white/[0.03] md:max-h-none">
              {gallery[imgIndex] ? (
                <img
                  src={gallery[imgIndex]}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            {gallery.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setImgIndex(i)}
                    className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border sm:h-14 sm:w-14 ${
                      i === imgIndex ? "border-gold" : "border-gold/20"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex min-h-0 flex-col overflow-y-auto p-4 sm:p-5">
            <DialogHeader className="pr-8 text-left">
              <DialogTitle className="font-display text-xl font-normal leading-tight sm:text-2xl">
                {product.title}
              </DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-[0.2em] text-gold/80">
                {product.sku ? `SKU ${product.sku}` : countryLabel}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-1 text-sm sm:mt-5">
              <p className="text-muted-foreground line-through">
                {formatClp(product.retailPrice)} retail
              </p>
              <p className={role === "mayorista" ? "font-medium text-gold" : "text-foreground/80"}>
                Mayorista (−{mPct}%): {formatClp(mayoristaPrice(product.retailPrice, pricing))}
              </p>
              <p className={role === "empresario" ? "font-medium text-gold" : "text-foreground/80"}>
                Empresario (−{ePct}%): {formatClp(empresarioPrice(product.retailPrice, pricing))}
              </p>
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 pt-6">
              <div className="flex items-center gap-3 rounded-full border border-gold/25 px-2 py-1">
                <button
                  type="button"
                  aria-label="Menos"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gold"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[1.5rem] text-center text-sm font-medium">{qty}</span>
                <button
                  type="button"
                  aria-label="Más"
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gold"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  onAdd(product, qty);
                  onOpenChange(false);
                }}
                className="flex-1 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-4 py-3 text-xs font-medium uppercase tracking-[0.2em] text-background shadow-[0_10px_30px_-10px] shadow-gold/40 active:scale-[0.98]"
              >
                Agregar · {formatClp(unit * qty)}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
