import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Minus, Plus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { CTA_ICONS } from "@/features/section-texts/cta-icons";
import type { CatalogCurrency } from "./catalog-meta";
import { buildOrderMessage, buildWhatsAppOrderUrl } from "./buildWhatsAppOrder";
import { buildOrderPdfFile } from "./buildOrderPdf";
import { shareOrderPdf } from "./shareOrderPdf";
import { formatPrice, roleLabel } from "./pricing";
import type { InvestorRole, OrderLine } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: OrderLine[];
  role: InvestorRole;
  orderId: string;
  customerName: string;
  customerCity: string;
  customerDocument: string;
  customerPhone: string;
  totalAmount: number;
  totalPieces: number;
  whatsappUrl: string;
  countryName?: string;
  currency?: CatalogCurrency;
  locale?: string;
  onSetQty: (handle: string, qty: number) => void;
  onRemove: (handle: string) => void;
  onNameChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onDocumentChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
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
  customerDocument,
  customerPhone,
  totalAmount,
  totalPieces,
  whatsappUrl,
  countryName = "Chile",
  currency = "CLP",
  locale = "es-CL",
  onSetQty,
  onRemove,
  onNameChange,
  onCityChange,
  onDocumentChange,
  onPhoneChange,
  onClear,
}: Props) {
  const WaIcon = CTA_ICONS.whatsapp;
  const money = (n: number) => formatPrice(n, currency, locale);

  const message = buildOrderMessage({
    orderId,
    role,
    items,
    customerName,
    customerCity,
    countryName,
    currency,
    locale,
  });

  const waHref = buildWhatsAppOrderUrl(whatsappUrl, message);

  const pdfOptions = {
    orderId,
    role,
    items,
    customerName,
    customerCity,
    customerDocument,
    customerPhone,
    countryName,
    currency,
    locale,
  };
  const pdfOptionsRef = useRef(pdfOptions);
  pdfOptionsRef.current = pdfOptions;

  // El PDF se arma por adelantado: navigator.share necesita el gesto del
  // usuario y en iOS caduca si antes se espera a generarlo.
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!open || items.length === 0) {
      setPdfFile(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      buildOrderPdfFile(pdfOptionsRef.current)
        .then((file) => {
          if (!cancelled) setPdfFile(file);
        })
        .catch(() => {
          if (!cancelled) setPdfFile(null);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, items, role, orderId, customerName, customerCity, customerDocument, customerPhone]);

  useEffect(() => {
    if (!open) setStatus(null);
  }, [open]);

  const sendOrder = useCallback(async () => {
    if (!items.length || sending) return;
    setSending(true);
    setStatus(null);
    try {
      const file = pdfFile ?? (await buildOrderPdfFile(pdfOptionsRef.current));
      const outcome = await shareOrderPdf(file, { message, whatsappUrl: waHref });
      if (outcome === "downloaded") {
        setStatus("Descargamos el PDF y abrimos WhatsApp: adjúntalo en el chat del asesor.");
      } else if (outcome === "cancelled") {
        setStatus(null);
      }
    } catch {
      setStatus("No pudimos generar el PDF. Abre WhatsApp y envía el resumen.");
      window.open(waHref, "_blank", "noopener,noreferrer");
    } finally {
      setSending(false);
    }
  }, [items.length, sending, pdfFile, message, waHref]);

  const downloadPdf = useCallback(async () => {
    const file = pdfFile ?? (await buildOrderPdfFile(pdfOptionsRef.current));
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }, [pdfFile]);

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
                  className="flex gap-3 rounded-2xl border border-gold/15 bg-surface p-2.5"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-strong">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm leading-snug text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {money(item.unitPrice)} c/u
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
                          {money(item.unitPrice * item.qty)}
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
              className="border-gold/20 bg-surface"
            />
            <Input
              value={customerCity}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="Ciudad"
              className="border-gold/20 bg-surface"
            />
            <Input
              value={customerDocument}
              onChange={(e) => onDocumentChange(e.target.value)}
              placeholder="C.C. / NIT (opcional)"
              className="border-gold/20 bg-surface"
            />
            <Input
              value={customerPhone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="Teléfono (opcional)"
              inputMode="tel"
              className="border-gold/20 bg-surface"
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
                <span className="font-display text-2xl text-gold">{money(totalAmount)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-2 border-t border-gold/15 bg-background px-5 py-4">
          <button
            type="button"
            onClick={sendOrder}
            disabled={!items.length || sending}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-xs font-medium uppercase tracking-[0.22em] transition-all ${
              items.length && !sending
                ? "bg-gradient-to-r from-gold via-gold-light to-gold text-background shadow-[0_10px_30px_-10px] shadow-gold/40 active:scale-[0.98]"
                : "pointer-events-none bg-muted text-muted-foreground"
            }`}
          >
            <WaIcon className="h-4 w-4" strokeWidth={2.2} />
            {sending ? "Preparando pedido…" : "Enviar pedido por WhatsApp"}
          </button>
          {status && (
            <p className="px-1 text-center text-[11px] leading-relaxed text-muted-foreground">
              {status}
            </p>
          )}
          {items.length > 0 && (
            <button
              type="button"
              onClick={downloadPdf}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold/30 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold/10"
            >
              <FileText className="h-3.5 w-3.5" strokeWidth={2} />
              Descargar PDF
            </button>
          )}
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
