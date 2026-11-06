import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";

import logo from "@/assets/italux-logo.png";
import { getCatalogMeta } from "@/features/catalog/catalog-meta";
import { formatPrice, roleLabel } from "@/features/catalog/pricing";
import {
  payloadToOrderLines,
  readPayloadFromHash,
  type OrderPayload,
} from "@/features/catalog/orderLink";
import { buildOrderPdfFile } from "@/features/catalog/buildOrderPdf";
import { ThemeToggle } from "@/features/theme/ThemeToggle";

/** El pedido viaja en el hash, que no llega al servidor: la página es cliente. */
export const Route = createFileRoute("/pedido")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Pedido — ITALUX Joyería" }, { name: "robots", content: "noindex" }],
  }),
  component: OrderPage,
});

function OrderPage() {
  const [payload, setPayload] = useState<OrderPayload | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setPayload(readPayloadFromHash(window.location.hash));
    setLoaded(true);
  }, []);

  const meta = payload ? getCatalogMeta(payload.co) : undefined;
  const currency = meta?.currency ?? "COP";
  const locale = meta?.locale ?? "es-CO";
  const money = (n: number) => formatPrice(n, currency, locale);

  const items = useMemo(() => (payload ? payloadToOrderLines(payload) : []), [payload]);
  const total = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const totalRetail = items.reduce((sum, i) => sum + (i.retailPrice ?? i.unitPrice) * i.qty, 0);
  const pieces = items.reduce((sum, i) => sum + i.qty, 0);

  const downloadPdf = async () => {
    if (!payload) return;
    setDownloading(true);
    try {
      const file = await buildOrderPdfFile({
        orderId: payload.o,
        role: payload.r,
        items,
        customerName: payload.n,
        customerCity: payload.c,
        customerDocument: payload.d,
        customerPhone: payload.p,
        countryName: meta?.name,
        currency,
        locale,
      });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setDownloading(false);
    }
  };

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <p className="text-sm">Abriendo el pedido…</p>
      </main>
    );
  }

  if (!payload || items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="max-w-sm">
          <FileText className="mx-auto h-8 w-8 text-gold" strokeWidth={1.5} />
          <h1 className="font-display mt-4 text-2xl font-light">Pedido no disponible</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            El enlace está incompleto. Pídele al comprador que vuelva a enviarlo desde el catálogo.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full border border-gold/40 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gold"
          >
            Ir al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground antialiased">
      <ThemeToggle floating />

      <article className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-gold/20 bg-surface">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-gold/15 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="ITALUX"
              className="h-12 w-12 rounded-xl object-contain ring-1 ring-gold/20 dark:ring-0"
            />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
                ITALUX Joyería
              </p>
              <p className="text-[11px] text-muted-foreground">
                Catálogo Inversionistas{meta?.name ? ` · ${meta.name}` : ""}
              </p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="font-display text-3xl font-light leading-none">Pedido</h1>
            <dl className="mt-2 space-y-0.5 text-[11px]">
              <div className="flex justify-end gap-2">
                <dt className="font-medium">Nº:</dt>
                <dd className="text-muted-foreground">{payload.o}</dd>
              </div>
              <div className="flex justify-end gap-2">
                <dt className="font-medium">Tipo:</dt>
                <dd className="text-muted-foreground">{roleLabel(payload.r)}</dd>
              </div>
              <div className="flex justify-end gap-2">
                <dt className="font-medium">Estado:</dt>
                <dd className="text-muted-foreground">Por confirmar</dd>
              </div>
            </dl>
          </div>
        </header>

        <section className="grid gap-2 border-b border-gold/15 px-5 py-4 text-sm sm:grid-cols-2 sm:px-7">
          <Field label={roleLabel(payload.r)} value={payload.n || "—"} />
          {payload.d && <Field label="C.C. / NIT" value={payload.d} />}
          {payload.c && <Field label="Ciudad" value={payload.c} />}
          {payload.p && <Field label="Teléfono" value={payload.p} />}
        </section>

        <div className="overflow-x-auto">
          <table className="w-full text-sm sm:min-w-[34rem]">
            <thead className="bg-surface-strong text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="hidden px-4 py-3 text-left font-medium sm:table-cell sm:px-7">
                  Ref.
                </th>
                <th className="px-2 py-3 text-center font-medium">Cant.</th>
                <th className="px-2 py-3 text-left font-medium">Descripción</th>
                <th className="px-2 py-3 text-right font-medium">{roleLabel(payload.r)}</th>
                <th className="hidden px-2 py-3 text-right font-medium sm:table-cell">Detal</th>
                <th className="px-4 py-3 text-right font-medium sm:px-7">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.handle} className="border-t border-gold/10">
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell sm:px-7">
                    {item.sku || "—"}
                  </td>
                  <td className="px-2 py-3 text-center">{item.qty}</td>
                  <td className="px-2 py-3">{item.title}</td>
                  <td className="px-2 py-3 text-right">{money(item.unitPrice)}</td>
                  <td className="hidden px-2 py-3 text-right text-muted-foreground sm:table-cell">
                    {item.retailPrice ? money(item.retailPrice) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium sm:px-7">
                    {money(item.unitPrice * item.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="border-t border-gold/15 px-5 py-5 sm:px-7">
          <div className="flex items-center justify-between rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/10 to-transparent px-4 py-3">
            <span className="text-sm font-medium">Total del pedido</span>
            <span className="font-display text-2xl text-gold">{money(total)}</span>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
            <Summary label="Total unidades" value={String(pieces)} />
            <Summary label="Total a precio detal" value={money(totalRetail)} />
            <Summary label={`Total ${roleLabel(payload.r).toLowerCase()}`} value={money(total)} />
          </dl>

          <button
            type="button"
            onClick={downloadPdf}
            disabled={downloading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-background transition-all active:scale-[0.98] disabled:opacity-60"
          >
            <Download className="h-4 w-4" strokeWidth={2.2} />
            {downloading ? "Generando PDF…" : "Descargar PDF"}
          </button>

          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Pedido generado desde el catálogo en línea de ITALUX. Precios sujetos a confirmación y
            disponibilidad.
          </p>
        </section>
      </article>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="font-medium">{label}:</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gold/15 bg-surface-strong px-2 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
