/**
 * Seed investor_catalogs + investor_products from TS packs + Excel mayoristas.
 *
 * Uso:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-investor-catalogs.mjs
 *
 * Requiere: SUPABASE_URL (o VITE_SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvFile();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Falta SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Dashboard → Project Settings → API → service_role (secret).",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ——— Dynamic import of product packs via tsx/compiled? Use regex parse of TS files ———
function parsePack(tsPath) {
  const text = readFileSync(tsPath, "utf8");
  const blocks = text.split(/\{\s*handle:/).slice(1);
  const products = [];
  for (const b of blocks) {
    const h = b.match(/^\s*"([^"]+)"/);
    const title = b.match(/title:\s*"((?:\\.|[^"])*)"/);
    const sku = b.match(/sku:\s*"([^"]*)"/);
    const retail = b.match(/retailPrice:\s*([0-9.]+)/);
    const compare = b.match(/compareAtPrice:\s*(null|[0-9.]+)/);
    const image = b.match(/imageUrl:\s*"([^"]*)"/);
    const gallery = [...b.matchAll(/galleryUrls:\s*\[([\s\S]*?)\]/g)][0];
    const tagsM = b.match(/tags:\s*\[([\s\S]*?)\]/);
    const catsM = b.match(/categories:\s*\[([\s\S]*?)\]/);
    if (!h || !retail) continue;
    const galleryUrls = gallery
      ? [...gallery[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
      : [];
    const tags = tagsM
      ? [...tagsM[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
      : [];
    const categories = catsM
      ? [...catsM[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
      : [];
    products.push({
      handle: h[1],
      title: title ? title[1] : h[1],
      sku: sku ? sku[1].trim() : "",
      retailPrice: Number(retail[1]),
      compareAtPrice:
        !compare || compare[1] === "null" ? null : Number(compare[1]),
      imageUrl: image ? image[1] : "",
      galleryUrls,
      tags,
      categories,
    });
  }
  return products;
}

import { execFileSync } from "node:child_process";

function parseExcelMayoristas(xlsxPath) {
  const helper = resolve(root, "scripts/_parse_mayoristas_xlsx.py");
  const out = execFileSync("python3", [helper, xlsxPath], {
    encoding: "utf8",
    maxBuffer: 20_000_000,
  });
  return JSON.parse(out);
}

const STOP = new Set([
  "de",
  "la",
  "el",
  "los",
  "las",
  "y",
  "con",
  "para",
  "en",
  "del",
  "copia",
  "hombre",
  "mujer",
  "dama",
  "caballero",
  "ref",
]);

/** Sinónimos de estilo (Shopify ↔ Excel). */
const STYLE_ALIASES = {
  eslabon: ["cartier", "carter"],
  cartier: ["eslabon", "carter"],
  carter: ["cartier", "eslabon"],
  chinesa: ["chinesca"],
  chinesca: ["chinesa"],
  entrelazada: ["cruzada"],
  cruzada: ["entrelazada"],
  cafe: ["café"],
};

function normText(s) {
  let t = String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  // Abreviaturas del Excel: C. CUBANA → cadena cubana
  t = t
    .replace(/\bd\.\s*/g, "dije ")
    .replace(/\bc\.\s*/g, "cadena ")
    .replace(/\bp\.\s*/g, "pulsera ")
    .replace(/\bt\.\s*/g, "topo ")
    .replace(/\bcrus\b/g, "cruz")
    .replace(/\bcartier\b/g, "carter");
  t = t.replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  return t;
}

function toks(s) {
  return new Set(
    normText(s)
      .split(/\s+/)
      .filter((w) => w && !STOP.has(w)),
  );
}

function expandStyle(set) {
  const out = new Set(set);
  for (const t of set) {
    for (const a of STYLE_ALIASES[t] || []) out.add(a);
  }
  return out;
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / new Set([...a, ...b]).size;
}

function mmSet(...parts) {
  const hay = parts.join(" ").toLowerCase();
  return new Set(
    [...hay.matchAll(/(\d+(?:\.\d+)?)\s*mm/g)].map((m) => m[1]),
  );
}

function cmSet(...parts) {
  const hay = parts.join(" ").toLowerCase();
  return new Set(
    [...hay.matchAll(/(\d+(?:\.\d+)?)\s*cm/g)].map((m) => m[1]),
  );
}

function stripVariantTitle(title) {
  return String(title || "").split(/\s*[·•]\s*/)[0].trim();
}

/** SKUs numéricos desde "42395 - 25444", "54883-0", "42793 + 24557". */
function skuCandidates(sku) {
  const s = String(sku || "").trim();
  if (!s) return [];
  if (/^\d+$/.test(s)) return [s];
  return [...s.matchAll(/\d{4,}/g)].map((m) => m[0]);
}

function mmCompatible(productMm, excelMm) {
  if (!productMm.size || !excelMm.size) return true; // no data → no block
  for (const m of productMm) if (excelMm.has(m)) return true;
  return false;
}

function styleOverlap(a, b) {
  const styles = [
    "cubana",
    "chinesca",
    "chinesa",
    "carter",
    "cartier",
    "eslabon",
    "franco",
    "egipcia",
    "lazo",
    "veneciana",
    "serpiente",
    "grabada",
    "cruzada",
    "entrelazada",
    "grano",
    "cafe",
    "militar",
    "singapore",
    "singapur",
    "caracol",
    "balin",
    "continua",
    "rustica",
    "cordon",
    "trigo",
    "ancla",
    "virgen",
    "cruz",
    "madero",
    "dolar",
    "guadalupe",
  ];
  const A = expandStyle(a);
  const B = expandStyle(b);
  return styles.some((st) => A.has(st) && B.has(st));
}

const CATALOGS = [
  { code: "CL", name: "Chile", flag: "🇨🇱", slug: "chile", currency: "CLP", locale: "es-CL", sheet: "CHILE", pack: "chile-products.ts" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", slug: "colombia", currency: "COP", locale: "es-CO", sheet: "COLOMBIA", pack: "colombia-products.ts" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", slug: "ecuador", currency: "USD", locale: "es-EC", sheet: "ECUADOR", pack: "ecuador-products.ts" },
  { code: "ES", name: "España", flag: "🇪🇸", slug: "espana", currency: "EUR", locale: "es-ES", sheet: "ESPANA", pack: "spain-products.ts" },
];

function roundMoney(n, currency) {
  if (currency === "CLP" || currency === "COP") return Math.round(n);
  return Math.round(n * 100) / 100;
}

function matchMayorista(product, excelRows, usedSkus, currency) {
  const productMm = mmSet(product.title, product.handle);
  const productCm = cmSet(product.title, product.handle);
  const candidates = skuCandidates(product.sku);
  const isCompound =
    Boolean(product.sku) &&
    (product.sku.includes("-") ||
      product.sku.includes("+") ||
      candidates.length > 1);

  // 1) SKU (exact o extraído), validando mm si ambos lados lo tienen.
  // Combos con varios SKUs ("42395 - 25444") no consumen el SKU del Excel
  // para no bloquear la variante individual correspondiente.
  const multiSkuCombo = candidates.length > 1;
  for (const cand of candidates) {
    if (usedSkus.has(cand)) continue;
    const hit = excelRows.find((e) => e.sku === cand);
    if (!hit) continue;
    const excelMm = mmSet(hit.nombre);
    // En combos multi-SKU no exigimos mm (el 1º SKU suele ser la cadena)
    if (!multiSkuCombo && !mmCompatible(productMm, excelMm)) continue;
    if (!multiSkuCombo) usedSkus.add(hit.sku);
    return {
      mayorista: roundMoney(hit.mayorista, currency),
      provisional: isCompound || multiSkuCombo,
      match: "sku",
    };
  }

  const baseTitle = stripVariantTitle(product.title);
  const pn = new Set([...toks(baseTitle), ...toks(product.title)]);

  const scored = excelRows
    .filter((e) => !usedSkus.has(e.sku))
    .map((e) => {
      const en = new Set([
        ...toks(e.nombre),
        ...(e.n ? String(e.n).split(/\s+/).filter(Boolean) : []),
      ]);
      let sc = jaccard(pn, en);
      const excelMm = mmSet(e.nombre);
      const excelCm = cmSet(e.nombre);
      if (productMm.size && excelMm.size) {
        if (mmCompatible(productMm, excelMm)) sc += 0.22;
        else sc -= 0.25;
      }
      if (productCm.size && excelCm.size) {
        for (const c of productCm) {
          if (excelCm.has(c)) {
            sc += 0.08;
            break;
          }
        }
      }
      if (styleOverlap(pn, en)) sc += 0.12;
      else sc -= 0.08;
      return { e, sc, en, excelMm };
    })
    .sort((a, b) => b.sc - a.sc);

  // 2) Nombre firme: score alto + (estilo o mm) + gap vs 2º
  const firm = scored.filter((x) => {
    if (x.sc < 0.55) return false;
    if (productMm.size && x.excelMm.size && !mmCompatible(productMm, x.excelMm)) {
      return false;
    }
    return styleOverlap(pn, x.en) || (productMm.size && mmCompatible(productMm, x.excelMm));
  });
  if (
    firm.length >= 1 &&
    (firm.length === 1 || firm[0].sc - firm[1].sc >= 0.04)
  ) {
    usedSkus.add(firm[0].e.sku);
    return {
      mayorista: roundMoney(firm[0].e.mayorista, currency),
      provisional: false,
      match: "name",
    };
  }

  // 3) Estimate (no consume SKU)
  if (scored[0] && scored[0].sc >= 0.32) {
    return {
      mayorista: roundMoney(scored[0].e.mayorista, currency),
      provisional: true,
      match: "estimate",
    };
  }

  const fam = ["cadena", "pulsera", "dije", "combo", "topo", "arete"].find((t) =>
    pn.has(t),
  );
  if (fam) {
    const famPrices = excelRows
      .filter((e) => toks(e.nombre).has(fam))
      .map((e) => e.mayorista);
    if (famPrices.length) {
      const sorted = [...famPrices].sort((a, b) => a - b);
      const mid = sorted[Math.floor(sorted.length / 2)];
      return {
        mayorista: roundMoney(mid, currency),
        provisional: true,
        match: "estimate_family",
      };
    }
  }
  return {
    mayorista: roundMoney(product.retailPrice * 0.7, currency),
    provisional: true,
    match: "fallback",
  };
}

async function main() {
  const xlsx = resolve(root, "precios mayoristas migue.xlsx");
  if (!existsSync(xlsx)) {
    console.error("No está el Excel:", xlsx);
    process.exit(1);
  }
  console.log("Leyendo Excel…");
  const excelBySheet = parseExcelMayoristas(xlsx);

  const stats = { sku: 0, name: 0, estimate: 0, estimate_family: 0, fallback: 0 };

  for (const cat of CATALOGS) {
    console.log(`\n=== ${cat.code} ${cat.name} ===`);
    const { error: cErr } = await supabase.from("investor_catalogs").upsert(
      {
        code: cat.code,
        name: cat.name,
        flag: cat.flag,
        slug: cat.slug,
        currency: cat.currency,
        locale: cat.locale,
        title: "Catálogo Inversionistas",
        button_label: "Catálogo Inversionistas",
        is_active: true,
        empresario_discount: 0.3,
      },
      { onConflict: "code" },
    );
    if (cErr) throw cErr;

    const pack = parsePack(resolve(root, "src/features/catalog", cat.pack));
    const excel = excelBySheet[cat.sheet] || [];
    const used = new Set();
    const rows = pack.map((p) => {
      const m = matchMayorista(p, excel, used, cat.currency);
      stats[m.match] = (stats[m.match] || 0) + 1;
      return {
        catalog_code: cat.code,
        handle: p.handle,
        title: p.title,
        sku: p.sku,
        retail_price: p.retailPrice,
        compare_at_price: p.compareAtPrice,
        mayorista_price: m.mayorista,
        mayorista_is_provisional: m.provisional,
        mayorista_match: m.match,
        image_url: p.imageUrl,
        gallery_urls: p.galleryUrls,
        tags: p.tags,
        categories: p.categories,
        is_active: true,
      };
    });

    // wipe + insert for idempotent seed
    const { error: delErr } = await supabase
      .from("investor_products")
      .delete()
      .eq("catalog_code", cat.code);
    if (delErr) throw delErr;

    const chunk = 80;
    for (let i = 0; i < rows.length; i += chunk) {
      const slice = rows.slice(i, i + chunk);
      const { error } = await supabase.from("investor_products").insert(slice);
      if (error) throw error;
    }
    console.log(`  productos: ${rows.length}`);
  }

  console.log("\nResumen match:", stats);
  console.log("Seed OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
