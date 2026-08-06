import { Minus, Plus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { CTA_ICONS } from "@/features/section-texts/cta-icons";
import { buildOrderMessage, buildWhatsAppOrderUrl } from "./buildWhatsAppOrder";
import { formatClp, roleLabel } from "./pricing";
import type { InvestorRole, OrderLine } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: OrderLine[];
  role: InvestorRole;
  orderId: string;
  customerName: string;
  customerCity: string;
  totalAmount: number;
  totalPieces: number;
  whatsappUrl: string;
  countryName?: string;
  onSetQty: (handle: string, qty: number) => void;
  onRemove: (handle: string) => void;
  onNameChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onClear: () => void;
};

export function OrderSheet({
  open,
  onOpenChange,
  items,
  role,
  orderId,
  customerName,
  customerCity,
  totalAmount,
  totalPieces,
  whatsappUrl,
  countryName = "Chile",
  onSetQty,
  onRemove,
  onNameChange,
  onCityChange,
  onClear,
}: Props) {
  const WaIcon = CTA_ICONS.whatsapp;

  const message = buildOrderMessage({
    orderId,
    role,
    items,
    customerName,
    customerCity,
    countryName,
  });

  const waHref = buildWhatsAppOrderUrl(whatsappUrl, message);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full max-w-md flex-col overflow-hidden border-gold/20 bg-background px-0 pb-0 pt-6 sm:max-w-md"
      >
        <SheetHeader className="px-5 text-left">
          <SheetTitle className="font-display text-2xl font-normal">Tu pedido</SheetTitle>
          <SheetDescription className="text-xs">
            Invoice {orderId} · {roleLabel(role)}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex-1 space-y-4 overflow-y-auto px-5 pb-4">
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Aún no has agregado productos.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.handle}
                  className="flex gap-3 rounded-2xl border border-gold/15 bg-white/[0.02] p-2.5"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm leading-snug text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatClp(item.unitPrice)} c/u
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 rounded-full border border-gold/20 px-1.5">
                        <button
                          type="button"
                          aria-label="Menos"
                          onClick={() => onSetQty(item.handle, item.qty - 1)}
                          className="flex h-7 w-7 items-center justify-center text-gold"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[1.25rem] text-center text-xs font-medium">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Más"
                          onClick={() => onSetQty(item.handle, item.qty + 1)}
                          className="flex h-7 w-7 items-center justify-center text-gold"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gold">
                          {formatClp(item.unitPrice * item.qty)}
                        </span>
                        <button
                          type="button"
                          aria-label="Eliminar"
                          onClick={() => onRemove(item.handle)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2 rounded-2xl border border-gold/15 p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold/80">
              Datos para el asesor
            </p>
            <Input
              value={customerName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Tu nombre"
              className="border-gold/20 bg-white/[0.02]"
            />
            <Input
              value={customerCity}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="Ciudad"
              className="border-gold/20 bg-white/[0.02]"
            />
          </div>

          {items.length > 0 && (
            <div className="rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/10 to-transparent p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Piezas</span>
                <span>{totalPieces}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-2xl text-gold">{formatClp(totalAmount)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-2 border-t border-gold/15 bg-background px-5 py-4">
          <a
            href={items.length ? waHref : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!items.length}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-xs font-medium uppercase tracking-[0.22em] transition-all ${
              items.length
                ? "bg-gradient-to-r from-gold via-gold-light to-gold text-background shadow-[0_10px_30px_-10px] shadow-gold/40 active:scale-[0.98]"
                : "pointer-events-none bg-white/10 text-muted-foreground"
            }`}
          >
            <WaIcon className="h-4 w-4" strokeWidth={2.2} />
            Enviar pedido por WhatsApp
          </a>
          {items.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="w-full py-2 text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Vaciar pedido
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
