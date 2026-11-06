import type { InvestorRole, OrderLine } from "./types";

/**
 * El pedido viaja dentro del propio link, en el fragmento (#), así el asesor
 * abre el invoice con un toque y no hace falta guardar nada en un servidor.
 * El fragmento no se envía al servidor, así que los datos del comprador no
 * quedan en logs de acceso.
 */

export type OrderPayload = {
  /** Versión del formato, por si cambia la forma del link. */
  v: 1;
  /** Nº de pedido */
  o: string;
  /** Rol */
  r: InvestorRole;
  /** Código de país del catálogo */
  co: string;
  /** Nombre, ciudad, documento, teléfono */
  n?: string;
  c?: string;
  d?: string;
  p?: string;
  /** Líneas: [handle, título, sku, cantidad, precio del rol, precio detal] */
  i: [string, string, string, number, number, number][];
};

export const ORDER_HASH_KEY = "p";

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function buildOrderPayload(opts: {
  orderId: string;
  role: InvestorRole;
  countryCode: string;
  items: OrderLine[];
  customerName?: string;
  customerCity?: string;
  customerDocument?: string;
  customerPhone?: string;
}): OrderPayload {
  return {
    v: 1,
    o: opts.orderId,
    r: opts.role,
    co: opts.countryCode,
    ...(opts.customerName?.trim() ? { n: opts.customerName.trim() } : {}),
    ...(opts.customerCity?.trim() ? { c: opts.customerCity.trim() } : {}),
    ...(opts.customerDocument?.trim() ? { d: opts.customerDocument.trim() } : {}),
    ...(opts.customerPhone?.trim() ? { p: opts.customerPhone.trim() } : {}),
    i: opts.items.map((item) => [
      item.handle,
      item.title,
      item.sku ?? "",
      item.qty,
      Math.round(item.unitPrice * 100) / 100,
      Math.round((item.retailPrice ?? 0) * 100) / 100,
    ]),
  };
}

export function encodeOrderPayload(payload: OrderPayload): string {
  return toBase64Url(JSON.stringify(payload));
}

export function decodeOrderPayload(encoded: string): OrderPayload | null {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded)) as OrderPayload;
    if (parsed?.v !== 1 || !Array.isArray(parsed.i)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Link absoluto al invoice; origin sale de window.location en el navegador. */
export function buildOrderPageUrl(origin: string, payload: OrderPayload): string {
  return `${origin.replace(/\/$/, "")}/pedido#${ORDER_HASH_KEY}=${encodeOrderPayload(payload)}`;
}

/** Devuelve el payload que viene en el hash de la URL actual. */
export function readPayloadFromHash(hash: string): OrderPayload | null {
  const raw = hash.replace(/^#/, "");
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  const encoded = params.get(ORDER_HASH_KEY);
  return encoded ? decodeOrderPayload(encoded) : null;
}

export function payloadToOrderLines(payload: OrderPayload): OrderLine[] {
  return payload.i.map(([handle, title, sku, qty, unitPrice, retailPrice]) => ({
    handle,
    title,
    sku,
    imageUrl: "",
    qty,
    unitPrice,
    retailPrice: retailPrice || undefined,
    role: payload.r,
  }));
}
