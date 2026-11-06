import logoUrl from "@/assets/italux-logo.png";
import type { CatalogCurrency } from "./catalog-meta";
import { formatPrice, roleLabel } from "./pricing";
import type { InvestorRole, OrderLine } from "./types";

/**
 * Arma el PDF del pedido con el formato de remisión que usa el cliente:
 * cabecera con número y fecha, datos del comprador, tabla de productos con
 * precio del rol y detal, franja de totales y resumen.
 *
 * jspdf se carga en el momento de generar el PDF (import dinámico), así no
 * pesa en el bundle de quien solo navega el catálogo.
 */

export type OrderPdfOptions = {
  orderId: string;
  role: InvestorRole;
  items: OrderLine[];
  customerName?: string;
  customerCity?: string;
  customerDocument?: string;
  customerPhone?: string;
  countryName?: string;
  currency?: CatalogCurrency;
  locale?: string;
};

const INK: [number, number, number] = [34, 32, 28];
const MUTED: [number, number, number] = [122, 116, 107];
const GOLD: [number, number, number] = [168, 130, 58];
const LINE: [number, number, number] = [223, 216, 204];
const HEAD_FILL: [number, number, number] = [243, 240, 233];
const ZEBRA: [number, number, number] = [250, 248, 244];

const MARGIN = 14;

function today(locale: string): string {
  return new Date().toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** El PNG del logo trae fondo oscuro, así que va sobre una placa del mismo tono. */
async function loadLogo(): Promise<HTMLImageElement | null> {
  if (typeof window === "undefined") return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = logoUrl;
  });
}

export async function buildOrderPdfBlob(opts: OrderPdfOptions): Promise<Blob> {
  const [{ jsPDF }, { default: autoTable }, logo] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    loadLogo(),
  ]);

  const currency = opts.currency ?? "CLP";
  const locale = opts.locale ?? "es-CL";
  const country = opts.countryName ?? "";
  const money = (n: number) => formatPrice(n, currency, locale);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const right = pageWidth - MARGIN;

  // ——— Cabecera ———
  if (logo) {
    const size = 22;
    doc.setFillColor(20, 19, 17);
    doc.roundedRect(MARGIN, 12, size, size, 3, 3, "F");
    doc.addImage(logo, "PNG", MARGIN, 12, size, size);
  }

  doc.setTextColor(...INK);
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.text("Pedido", right, 21, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const headerRows: [string, string][] = [
    ["Nº", opts.orderId],
    ["Fecha", today(locale)],
    ["Tipo", roleLabel(opts.role)],
    ["Estado", "Por confirmar"],
  ];
  let hy = 28;
  for (const [label, value] of headerRows) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    const labelText = `${label}: `;
    const labelWidth = doc.getTextWidth(labelText);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    const valueWidth = doc.getTextWidth(value);
    doc.text(value, right, hy, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(labelText, right - valueWidth - labelWidth, hy);
    hy += 4.6;
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GOLD);
  doc.text("ITALUX JOYERÍA", MARGIN, 39);
  if (country) {
    doc.setTextColor(...MUTED);
    doc.text(`Catálogo Inversionistas · ${country}`, MARGIN, 43);
  }

  // ——— Datos del comprador ———
  let y = 50;
  const boxHeight = opts.customerCity || opts.customerPhone ? 16 : 11;
  doc.setDrawColor(...LINE);
  doc.roundedRect(MARGIN, y, pageWidth - MARGIN * 2, boxHeight, 2, 2, "S");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text(roleLabel(opts.role), MARGIN + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text(opts.customerName?.trim() || "—", MARGIN + 34, y + 7);

  if (opts.customerDocument?.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text("C.C. / NIT", right - 46, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(opts.customerDocument.trim(), right - 4, y + 7, { align: "right" });
  }

  if (opts.customerCity?.trim() || opts.customerPhone?.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text("Ciudad", MARGIN + 4, y + 12.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(opts.customerCity?.trim() || "—", MARGIN + 34, y + 12.5);

    if (opts.customerPhone?.trim()) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...INK);
      doc.text("Teléfono", right - 46, y + 12.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text(opts.customerPhone.trim(), right - 4, y + 12.5, { align: "right" });
    }
  }

  y += boxHeight + 6;

  // ——— Productos ———
  const items = opts.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const totalPieces = items.reduce((sum, i) => sum + i.qty, 0);
  const totalRetail = items.reduce((sum, i) => sum + (i.retailPrice ?? i.unitPrice) * i.qty, 0);

  autoTable(doc, {
    startY: y,
    head: [["Ref.", "Cant.", "Descripción", roleLabel(opts.role), "Detal", "Subtotal"]],
    body: items.map((item) => [
      item.sku || "—",
      String(item.qty),
      item.title,
      money(item.unitPrice),
      item.retailPrice ? money(item.retailPrice) : "—",
      money(item.unitPrice * item.qty),
    ]),
    margin: { left: MARGIN, right: MARGIN },
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: { top: 2, bottom: 2, left: 2.5, right: 2.5 },
      textColor: INK,
      lineColor: LINE,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: HEAD_FILL,
      textColor: INK,
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: { fillColor: ZEBRA },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 16, halign: "center" },
      2: { cellWidth: "auto" },
      3: { cellWidth: 26, halign: "right" },
      4: { cellWidth: 24, halign: "right", textColor: MUTED },
      5: { cellWidth: 26, halign: "right", fontStyle: "bold" },
    },
  });

  // @ts-expect-error autotable deja la posición final en el doc
  y = (doc.lastAutoTable?.finalY ?? y) + 6;

  // ——— Franja del total ———
  const stripHeight = 13;
  const stripWidth = pageWidth - MARGIN * 2;
  doc.setDrawColor(...LINE);
  doc.roundedRect(MARGIN, y, stripWidth, stripHeight, 2, 2, "S");
  doc.setFillColor(...HEAD_FILL);
  doc.rect(MARGIN + 0.6, y + 0.6, stripWidth * 0.3, stripHeight - 1.2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text("Total del pedido", MARGIN + 5, y + 8.3);
  doc.setFontSize(13);
  doc.text(money(subtotal), MARGIN + stripWidth - 5, y + 8.6, { align: "right" });

  y += stripHeight + 10;

  // ——— Resumen ———
  doc.setFont("times", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...INK);
  doc.text("Resumen", pageWidth / 2, y, { align: "center" });
  y += 5;

  const summary: [string, string][] = [
    ["Total unidades", String(totalPieces)],
    ["Total a precio detal", money(totalRetail)],
    [`Total ${roleLabel(opts.role).toLowerCase()}`, money(subtotal)],
  ];

  autoTable(doc, {
    startY: y,
    head: [summary.map(([label]) => label)],
    body: [summary.map(([, value]) => value)],
    margin: { left: MARGIN, right: MARGIN },
    styles: {
      font: "helvetica",
      fontSize: 9,
      halign: "center",
      textColor: INK,
      lineColor: LINE,
      lineWidth: 0.1,
      cellPadding: 3,
    },
    headStyles: { fillColor: HEAD_FILL, textColor: INK, fontStyle: "normal" },
    bodyStyles: { fillColor: [255, 255, 255], fontStyle: "bold" },
  });

  // @ts-expect-error autotable deja la posición final en el doc
  y = (doc.lastAutoTable?.finalY ?? y) + 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(
    "Pedido generado desde el catálogo en línea de ITALUX. Precios sujetos a confirmación y disponibilidad.",
    pageWidth / 2,
    y,
    { align: "center" },
  );

  return doc.output("blob");
}

export function orderPdfFilename(orderId: string): string {
  return `Pedido-ITALUX-${orderId}.pdf`;
}

export async function buildOrderPdfFile(opts: OrderPdfOptions): Promise<File> {
  const blob = await buildOrderPdfBlob(opts);
  return new File([blob], orderPdfFilename(opts.orderId), {
    type: "application/pdf",
  });
}
