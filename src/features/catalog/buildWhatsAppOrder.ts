import type { CatalogCurrency } from "./catalog-meta";
import { formatPrice, roleLabel } from "./pricing";
import type { OrderLine, InvestorRole } from "./types";

function stripWhatsAppQuery(url: string): string {
  try {
    const u = new URL(url);
    u.search = "";
    u.hash = "";
    return u.toString().replace(/\/$/, "");
  } catch {
    return url.split("?")[0].replace(/\/$/, "");
  }
}

export function buildOrderMessage(opts: {
  orderId: string;
  role: InvestorRole;
  items: OrderLine[];
  customerName?: string;
  customerCity?: string;
  countryName?: string;
  currency?: CatalogCurrency;
  locale?: string;
}): string {
  const country = opts.countryName ?? "Chile";
  const currency = opts.currency ?? "CLP";
  const locale = opts.locale ?? "es-CL";
  const money = (n: number) => formatPrice(n, currency, locale);

  const lines: string[] = [
    `*Pedido Catálogo Inversionistas — ${country}*`,
    `Nº: ${opts.orderId}`,
    `Rol: ${roleLabel(opts.role)}`,
  ];

  if (opts.customerName?.trim()) {
    lines.push(`Nombre: ${opts.customerName.trim()}`);
  }
  if (opts.customerCity?.trim()) {
    lines.push(`Ciudad: ${opts.customerCity.trim()}`);
  }

  lines.push("");

  let total = 0;
  let pieces = 0;

  for (const item of opts.items ?? []) {
    const lineTotal = item.unitPrice * item.qty;
    total += lineTotal;
    pieces += item.qty;
    const skuPart = item.sku ? ` (${item.sku})` : "";
    lines.push(
      `• ${item.title}${skuPart} x${item.qty} — ${money(item.unitPrice)} c/u = ${money(lineTotal)}`,
    );
  }

  lines.push("");
  lines.push(`*Total: ${money(total)}*`);
  lines.push(`Piezas: ${pieces}`);
  lines.push("");
  lines.push("Quiero confirmar este pedido.");

  return lines.join("\n");
}

export function buildWhatsAppOrderUrl(
  whatsappBaseUrl: string,
  message: string,
): string {
  const base = stripWhatsAppQuery(whatsappBaseUrl);
  return `${base}?text=${encodeURIComponent(message)}`;
}
