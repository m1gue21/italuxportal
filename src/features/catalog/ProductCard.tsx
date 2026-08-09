import { Plus } from "lucide-react";
import type { CatalogCurrency } from "./catalog-meta";
import type { CatalogProduct, InvestorRole } from "./types";
import {
  DEFAULT_PRICING,
  empresarioPct,
  empresarioPrice,
  formatPrice,
  mayoristaPrice,
  type PricingConfig,
} from "./pricing";

type Props = {
  product: CatalogProduct;
  role: InvestorRole;
  pricing?: PricingConfig;
  currency?: CatalogCurrency;
  locale?: string;
  onOpen: () => void;
  onQuickAdd: () => void;
};

export function ProductCard({
  product,
  role,
  pricing = DEFAULT_PRICING,
  currency = "CLP",
  locale = "es-CL",
  onOpen,
  onQuickAdd,
}: Props) {
  const mayorista = mayoristaPrice(product, currency);
  const empresario = empresarioPrice(product, pricing, currency);
  const ePct = empresarioPct(pricing);
  const money = (n: number) => formatPrice(n, currency, locale);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-gold/15 bg-gradient-to-b from-white/[0.04] to-white/[0.01]">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative aspect-square overflow-hidden bg-white/[0.03]">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>
        <div className="space-y-1.5 px-2.5 pt-2.5">
          <h3 className="font-display line-clamp-2 min-h-[2.5rem] text-[15px] leading-snug text-foreground">
            {product.title}
          </h3>
          <p className="text-[11px] text-muted-foreground line-through decoration-white/30">
            Sugerido: {money(product.retailPrice)}
          </p>
          <div className="space-y-0.5 text-[11px]">
            <p className={role === "mayorista" ? "font-medium text-gold" : "text-muted-foreground"}>
              Mayorista: {money(mayorista)}
            </p>
            <p className={role === "empresario" ? "font-medium text-gold" : "text-muted-foreground"}>
              Empresario (−{ePct}%): {money(empresario)}
            </p>
          </div>
        </div>
      </button>
      <div className="mt-auto p-2.5 pt-2">
        <button
          type="button"
          onClick={onQuickAdd}
          className="flex w-full items-center justify-center gap-1 rounded-xl border border-gold/40 bg-gold/10 py-2 text-[11px] font-medium uppercase tracking-[0.15em] text-gold transition-all hover:bg-gold/20 active:scale-[0.97]"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
          Agregar
        </button>
      </div>
    </article>
  );
}
