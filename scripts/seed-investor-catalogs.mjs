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

function toks(s) {
  return new Set(
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean),
  );
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / new Set([...a, ...b]).size;
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
  const sku = product.sku;
  if (sku && !sku.includes("-") && !sku.includes("+")) {
    const hit = excelRows.find((e) => e.sku === sku && !usedSkus.has(e.sku));
    if (hit) {
      usedSkus.add(hit.sku);
      return {
        mayorista: roundMoney(hit.mayorista, currency),
        provisional: false,
        match: "sku",
      };
    }
  }
  const pn = toks(product.title);
  // strong name
  const strong = excelRows
    .filter((e) => !usedSkus.has(e.sku))
    .map((e) => ({ e, sc: jaccard(pn, toks(e.nombre)) }))
    .filter((x) => x.sc >= 0.6)
    .sort((a, b) => b.sc - a.sc);
  if (
    strong.length === 1 ||
    (strong.length > 1 && strong[0].sc - strong[1].sc >= 0.05)
  ) {
    usedSkus.add(strong[0].e.sku);
    return {
      mayorista: roundMoney(strong[0].e.mayorista, currency),
      provisional: true,
      match: "name",
    };
  }
  // estimate
  const any = excelRows
    .map((e) => ({ e, sc: jaccard(pn, toks(e.nombre)) }))
    .sort((a, b) => b.sc - a.sc);
  if (any[0] && any[0].sc >= 0.25) {
    return {
      mayorista: roundMoney(any[0].e.mayorista, currency),
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
