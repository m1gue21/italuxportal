#!/usr/bin/env python3
"""Regenera packs TS desde exports Shopify (1 variante = 1 producto)
y escribe productos-con-variantes.md / .csv

  python3 scripts/generate-packs-from-shopify.py
"""
from __future__ import annotations

import csv
import json
import re
import unicodedata
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

ALL_CATEGORIES = ["Cadenas", "Pulseras", "Dijes", "Combos", "Hombre", "Mujer"]

SOURCES = [
    {
        "code": "CL",
        "name": "Chile",
        "csv": "products_export_1 CHILE PRODDUCTOS.csv",
        "out": "src/features/catalog/chile-products.ts",
        "export_name": "CHILE_PRODUCTS",
        "extra_export": f"export const CATALOG_CATEGORIES = {json.dumps(ALL_CATEGORIES)} as const;\n",
    },
    {
        "code": "CO",
        "name": "Colombia",
        "csv": "products_exportCOLOMBIA.csv",
        "out": "src/features/catalog/colombia-products.ts",
        "export_name": "COLOMBIA_PRODUCTS",
        "extra_export": "",
    },
    {
        "code": "EC",
        "name": "Ecuador",
        "csv": "products_exportECUADOR.csv",
        "out": "src/features/catalog/ecuador-products.ts",
        "export_name": "ECUADOR_PRODUCTS",
        "extra_export": "",
    },
    {
        "code": "ES",
        "name": "España",
        "csv": "products_exportESPAÑA.csv",
        "out": "src/features/catalog/spain-products.ts",
        "export_name": "SPAIN_PRODUCTS",
        "extra_export": "",
    },
]


def slug(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return (s[:60] if s else "var")


def clean_sku(s: str) -> str:
    return (s or "").strip().strip("'").strip('"')


def to_num(s: str):
    s = (s or "").strip()
    if not s:
        return None
    try:
        return float(s)
    except ValueError:
        return None


def infer_categories(tags: list[str], title: str, handle: str) -> list[str]:
    hay = " ".join([*tags, title, handle]).lower()
    out: list[str] = []
    for c in ALL_CATEGORIES:
        key = c.lower()
        if key in hay or (c == "Dijes" and "dije" in hay):
            out.append(c)
    for t in tags:
        if t in ALL_CATEGORIES and t not in out:
            out.append(t)
    return out


def ts_str(s: str) -> str:
    return json.dumps(s or "", ensure_ascii=False)


def emit_pack(export_name: str, products: list[dict], note: str, extra: str) -> str:
    lines = [
        'import type { CatalogProduct } from "./types";',
        "",
        f"/** {note} */",
        f"export const {export_name}: CatalogProduct[] = [",
    ]
    for p in products:
        retail = p["retailPrice"]
        retail_s = str(int(retail)) if float(retail).is_integer() else str(retail)
        compare = p["compareAtPrice"]
        if compare is None:
            compare_s = "null"
        else:
            compare_s = str(int(compare)) if float(compare).is_integer() else str(compare)
        lines.append("  {")
        lines.append(f"    handle: {ts_str(p['handle'])},")
        lines.append(f"    title: {ts_str(p['title'])},")
        lines.append(f"    sku: {ts_str(p['sku'])},")
        lines.append(f"    retailPrice: {retail_s},")
        lines.append(f"    compareAtPrice: {compare_s},")
        lines.append(f"    imageUrl: {ts_str(p['imageUrl'])},")
        lines.append("    galleryUrls: [")
        for g in p["galleryUrls"]:
            lines.append(f"      {ts_str(g)},")
        lines.append("    ],")
        lines.append("    tags: [")
        for t in p["tags"]:
            lines.append(f"      {ts_str(t)},")
        lines.append("    ],")
        lines.append("    categories: [")
        for c in p["categories"]:
            lines.append(f"      {ts_str(c)},")
        lines.append("    ],")
        lines.append("  },")
    lines.append("];")
    lines.append("")
    if extra:
        lines.append(extra.rstrip("\n"))
        lines.append("")
    return "\n".join(lines)


def parse_shopify(csv_path: Path):
    with csv_path.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    by: OrderedDict[str, list[dict]] = OrderedDict()
    for r in rows:
        h = (r.get("Handle") or "").strip()
        if not h:
            continue
        by.setdefault(h, []).append(r)

    products: list[dict] = []
    multi: list[dict] = []

    for handle, rs in by.items():
        title = next(((r.get("Title") or "").strip() for r in rs if (r.get("Title") or "").strip()), handle)
        tags_raw = next(((r.get("Tags") or "").strip() for r in rs if (r.get("Tags") or "").strip()), "")
        tags = [t.strip() for t in tags_raw.split(",") if t.strip()]
        status = next(
            ((r.get("Status") or "").strip().lower() for r in rs if (r.get("Status") or "").strip()),
            "active",
        )
        if status == "draft":
            continue

        gallery: list[str] = []
        for r in rs:
            img = (r.get("Image Src") or "").strip()
            if img and img not in gallery:
                gallery.append(img)

        variants: list[dict] = []
        # Shopify solo pone Option* Name en la 1ª fila del producto
        carry_o1n = ""
        carry_o2n = ""
        carry_o3n = ""
        for r in rs:
            o1n = (r.get("Option1 Name") or "").strip() or carry_o1n
            o1v = (r.get("Option1 Value") or "").strip()
            o2n = (r.get("Option2 Name") or "").strip() or carry_o2n
            o2v = (r.get("Option2 Value") or "").strip()
            o3n = (r.get("Option3 Name") or "").strip() or carry_o3n
            o3v = (r.get("Option3 Value") or "").strip()
            if o1n:
                carry_o1n = o1n
            if o2n:
                carry_o2n = o2n
            if o3n:
                carry_o3n = o3n

            price_raw = (r.get("Variant Price") or "").strip()
            compare_raw = (r.get("Variant Compare At Price") or "").strip()
            if (r.get("Price / Espana") or "").strip():
                price_raw = (r.get("Price / Espana") or "").strip()
            if (r.get("Compare At Price / Espana") or "").strip():
                compare_raw = (r.get("Compare At Price / Espana") or "").strip()

            price = to_num(price_raw)
            compare = to_num(compare_raw)
            sku = clean_sku(r.get("Variant SKU") or "")
            vimg = (r.get("Variant Image") or "").strip()
            if price is None or price <= 0:
                continue

            opts: list[tuple[str, str]] = []
            if o1v and o1n.lower() != "title":
                opts.append((o1n or "Opción", o1v))
            if o2v:
                opts.append((o2n or "Opción 2", o2v))
            if o3v:
                opts.append((o3n or "Opción 3", o3v))

            variants.append(
                {
                    "opts": opts,
                    "sku": sku,
                    "price": price,
                    "compare": compare,
                    "vimg": vimg,
                }
            )

        seen = set()
        uniq = []
        for v in variants:
            sig = (tuple(v["opts"]), v["sku"], v["price"])
            if sig in seen:
                continue
            seen.add(sig)
            uniq.append(v)
        if not uniq:
            continue

        meaningful = [v for v in uniq if v["opts"]]
        labels = [ " / ".join(val for _, val in v["opts"]) for v in meaningful ]
        is_multi = len(set(labels)) > 1
        categories = infer_categories(tags, title, handle)

        if is_multi:
            multi.append(
                {
                    "handle": handle,
                    "title": title,
                    "option_names": sorted({n for v in meaningful for n, _ in v["opts"]}),
                    "variants": [
                        {
                            "label": " / ".join(val for _, val in v["opts"]),
                            "sku": v["sku"],
                            "retailPrice": v["price"],
                            "compareAtPrice": v["compare"],
                            "vimg": v["vimg"],
                            "opts": v["opts"],
                        }
                        for v in meaningful
                    ],
                }
            )
            used_handles: set[str] = set()
            for v in meaningful:
                label = " / ".join(val for _, val in v["opts"])
                h2 = f"{handle}--{slug(label)}"
                if h2 in used_handles:
                    h2 = f"{h2}--{slug(v['sku'] or str(v['price']))}"
                used_handles.add(h2)
                img = v["vimg"] or (gallery[0] if gallery else "")
                g = []
                if img:
                    g.append(img)
                for x in gallery:
                    if x not in g:
                        g.append(x)
                products.append(
                    {
                        "handle": h2,
                        "title": f"{title} · {label}",
                        "sku": v["sku"],
                        "retailPrice": v["price"],
                        "compareAtPrice": v["compare"],
                        "imageUrl": img,
                        "galleryUrls": g,
                        "tags": tags,
                        "categories": categories,
                    }
                )
        else:
            v = uniq[0]
            img = v["vimg"] or (gallery[0] if gallery else "")
            g = []
            if img:
                g.append(img)
            for x in gallery:
                if x not in g:
                    g.append(x)
            products.append(
                {
                    "handle": handle,
                    "title": title,
                    "sku": v["sku"],
                    "retailPrice": v["price"],
                    "compareAtPrice": v["compare"],
                    "imageUrl": img,
                    "galleryUrls": g,
                    "tags": tags,
                    "categories": categories,
                }
            )

    products.sort(key=lambda p: p["title"].lower())
    multi.sort(key=lambda m: m["title"].lower())
    return products, multi


def main() -> None:
    summary = []
    report = []

    for src in SOURCES:
        csv_path = ROOT / src["csv"]
        products, multi = parse_shopify(csv_path)
        note = (
            f"Auto-generated from {src['csv']} — 1 Shopify variant = 1 product. "
            "Do not edit by hand."
        )
        ts = emit_pack(src["export_name"], products, note, src["extra_export"])
        (ROOT / src["out"]).write_text(ts, encoding="utf-8")

        variant_rows = sum(len(m["variants"]) for m in multi)
        summary.append(
            {
                "code": src["code"],
                "name": src["name"],
                "products": len(products),
                "multi": len(multi),
                "variants": variant_rows,
            }
        )
        report.append({"code": src["code"], "name": src["name"], "multi": multi})
        print(
            f"{src['code']}: {len(products)} productos "
            f"({len(multi)} padres → {variant_rows} variantes)"
        )

    md: list[str] = [
        "# Productos con variantes (Shopify → catálogo)",
        "",
        "Regla del cliente: **cada variante se publica como producto distinto** "
        "(`handle--slug-variante`, título `Producto · variante`).",
        "",
        "Se excluyen productos Shopify en status `draft`.",
        "",
        "## Resumen",
        "",
        "| País | Productos finales | Padres con variantes | Variantes expandidas |",
        "|---|---:|---:|---:|",
    ]
    for s in summary:
        md.append(
            f"| {s['name']} ({s['code']}) | {s['products']} | {s['multi']} | {s['variants']} |"
        )
    md.append("")

    for block in report:
        md.append(f"## {block['name']} ({block['code']})")
        md.append("")
        if not block["multi"]:
            md.append("_Sin productos multi-variante._")
            md.append("")
            continue
        for m in block["multi"]:
            md.append(f"### {m['title']}")
            md.append("")
            md.append(f"- Handle Shopify: `{m['handle']}`")
            md.append(f"- Opciones: {', '.join(m['option_names']) or '—'}")
            md.append("")
            md.append("| Variante | SKU | Retail | Compare-at | Handle catálogo |")
            md.append("|---|---|---:|---:|---|")
            for v in m["variants"]:
                h = f"{m['handle']}--{slug(v['label'])}"
                cmp = v["compareAtPrice"] if v["compareAtPrice"] is not None else "—"
                md.append(
                    f"| {v['label']} | {v['sku'] or '—'} | {v['retailPrice']} | {cmp} | `{h}` |"
                )
            md.append("")

    (ROOT / "productos-con-variantes.md").write_text("\n".join(md), encoding="utf-8")

    csv_out = ROOT / "productos-con-variantes.csv"
    with csv_out.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(
            [
                "country_code",
                "country_name",
                "parent_handle",
                "parent_title",
                "option_names",
                "variant_label",
                "variant_sku",
                "retail_price",
                "compare_at_price",
                "catalog_handle",
            ]
        )
        for block in report:
            for m in block["multi"]:
                for v in m["variants"]:
                    w.writerow(
                        [
                            block["code"],
                            block["name"],
                            m["handle"],
                            m["title"],
                            " | ".join(m["option_names"]),
                            v["label"],
                            v["sku"],
                            v["retailPrice"],
                            v["compareAtPrice"] if v["compareAtPrice"] is not None else "",
                            f"{m['handle']}--{slug(v['label'])}",
                        ]
                    )

    print(f"\nReporte: {ROOT / 'productos-con-variantes.md'}")
    print(f"CSV: {csv_out}")


if __name__ == "__main__":
    main()
