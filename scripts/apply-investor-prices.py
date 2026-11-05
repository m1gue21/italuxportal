#!/usr/bin/env python3
"""Aplica una tabla de precios inversionistas (xlsx) sobre un pack TS de productos.

La hoja debe traer una fila de encabezados con, al menos, NOMBRE PRODUCTO,
MAYORISTA (o MAYORITA) y EMPRESARIO; opcionalmente SKU y DETAL SUGERIDO.

Uso:
    python3 scripts/apply-investor-prices.py <xlsx> <pack.ts>            # informe
    python3 scripts/apply-investor-prices.py <xlsx> <pack.ts> --apply    # escribe
    ... --round 2        # monedas con decimales (USD/EUR); por defecto 0 (CLP/COP)

Escribe retailPrice (DETAL SUGERIDO), mayoristaPrice y empresarioPrice. Los
productos sin match seguro se dejan como están: el registry les calcula un
mayorista provisional.
"""
import argparse
import difflib
import re
import sys
import unicodedata
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_ID = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"

ABBR = [
    (r"\bd\.\s*", "dije "),
    (r"\bc\.\s*", "cadena "),
    (r"\bp\.\s*", "pulsera "),
    (r"\bt\.\s*", "topo "),
    (r"\bcrus\b", "cruz"),
    (r"\bcartier\b", "carter"),
]
STOP = {"de", "la", "el", "los", "las", "y", "con", "para", "en", "del", "copia",
        "hombre", "mujer", "dama", "caballero"}


# ——— xlsx ———

def _col_idx(ref: str) -> int:
    col = re.match(r"([A-Z]+)", ref).group(1)
    n = 0
    for c in col:
        n = n * 26 + (ord(c) - 64)
    return n - 1


def read_sheets(path: Path):
    """[(nombre_hoja, {fila: {col: valor}})] sin dependencias externas."""
    with zipfile.ZipFile(path) as z:
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si", NS):
                shared.append("".join(t.text or "" for t in si.findall(".//m:t", NS)))
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        rels = {
            r.attrib["Id"]: r.attrib["Target"]
            for r in ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        }
        for sh in wb.findall("m:sheets/m:sheet", NS):
            target = rels[sh.attrib[REL_ID]]
            if not target.startswith("xl/"):
                target = "xl/" + target.lstrip("/")
            root = ET.fromstring(z.read(target))
            rows = defaultdict(dict)
            for c in root.findall(".//m:sheetData/m:row/m:c", NS):
                row = int(re.search(r"(\d+)$", c.attrib["r"]).group(1))
                t = c.attrib.get("t")
                if t == "inlineStr":
                    node = c.find("m:is", NS)
                    val = "".join(x.text or "" for x in node.findall(".//m:t", NS)) if node is not None else None
                else:
                    v = c.find("m:v", NS)
                    if v is None or v.text is None:
                        val = None
                    elif t == "s":
                        val = shared[int(v.text)]
                    else:
                        try:
                            val = float(v.text)
                        except ValueError:
                            val = v.text
                rows[row][_col_idx(c.attrib["r"])] = val
            yield sh.attrib["name"], rows


def num(v):
    if isinstance(v, (int, float)):
        return float(v)
    return None


# ——— normalización de nombres ———

def specs(s: str):
    low = (s or "").lower()
    mm = tuple(sorted({float(x) for x in re.findall(r"(\d+(?:\.\d+)?)\s*mm", low)}))
    cm = tuple(sorted({float(x) for x in re.findall(r"(\d+(?:\.\d+)?)\s*cm", low)}))
    return mm, cm


def base_name(s: str) -> str:
    s = (s or "").lower().strip()
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    for a, b in ABBR:
        s = re.sub(a, b, s)
    s = re.sub(r"\d+(?:\.\d+)?\s*(mm|cm)", " ", s)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return " ".join(t for t in s.split() if t not in STOP and not t.isdigit())


def gender(s: str):
    low = (s or "").lower()
    if re.search(r"\b(hombre|caballero)\b", low):
        return "h"
    if re.search(r"\b(mujer|dama)\b", low):
        return "m"
    return None


# ——— tabla de precios ———

def load_prices(path: Path):
    want = {
        "sku": ("sku", "referencia", "ref"),
        "nombre": ("nombre producto", "nombre", "producto", "descripcion"),
        "empresario": ("empresario",),
        "mayorista": ("mayorista", "mayorita"),
        "sugerido": ("detal sugerido", "sugerido", "precio sugerido"),
    }
    out = []
    for _sheet, rows in read_sheets(path):
        if not rows:
            continue
        header_row = min(rows)
        header = {
            i: re.sub(r"\s+", " ", str(v or "")).strip().lower()
            for i, v in rows[header_row].items()
        }
        cols = {}
        for key, names in want.items():
            for i, label in header.items():
                if label in names:
                    cols[key] = i
                    break
        if "nombre" not in cols or "mayorista" not in cols:
            continue
        for r in sorted(rows):
            if r <= header_row:
                continue
            cells = rows[r]
            nombre = cells.get(cols["nombre"])
            mayorista = num(cells.get(cols["mayorista"]))
            if not nombre or mayorista is None:
                continue
            sku = cells.get(cols.get("sku", -1))
            if isinstance(sku, float) and sku.is_integer():
                sku = str(int(sku))
            elif sku is not None:
                sku = str(sku).strip()
            out.append({
                "sku": sku or "",
                "nombre": str(nombre).strip(),
                "mayorista": mayorista,
                "empresario": num(cells.get(cols.get("empresario", -1))),
                "sugerido": num(cells.get(cols.get("sugerido", -1))),
                "base": base_name(str(nombre)),
                "specs": specs(str(nombre)),
                "gen": gender(str(nombre)),
            })
    return out


# ——— pack TS ———

ENTRY_RE = re.compile(
    r'^\s*(handle|title|sku|retailPrice|compareAtPrice|mayoristaPrice|empresarioPrice):'
)


def load_pack(path: Path):
    """Divide el pack en entradas con sus rangos de líneas."""
    lines = path.read_text().splitlines(keepends=True)
    entries, start = [], None
    for i, line in enumerate(lines):
        if line.rstrip("\n") == "  {":
            start = i
        elif line.rstrip("\n") in ("  },", "  }") and start is not None:
            fields = {}
            for j in range(start, i + 1):
                m = ENTRY_RE.match(lines[j])
                if m:
                    fields[m.group(1)] = j
            title = re.search(r'title: "(.*)",', lines[fields["title"]]).group(1) if "title" in fields else ""
            sku = re.search(r'sku: "(.*)",', lines[fields["sku"]]).group(1) if "sku" in fields else ""
            entries.append({
                "start": start, "end": i, "lines": fields, "title": title, "sku": sku,
                "base": base_name(title), "specs": specs(title), "gen": gender(title),
            })
            start = None
    return lines, entries


def match(entries, prices):
    by_sku = {}
    for p in prices:
        if p["sku"]:
            by_sku.setdefault(p["sku"], p)
    seguros, dudosos, sin = [], [], []
    for e in entries:
        if e["sku"] and e["sku"] in by_sku:
            seguros.append((e, by_sku[e["sku"]], "sku", 1.0))
            continue
        best = None
        for p in prices:
            if e["gen"] and p["gen"] and e["gen"] != p["gen"]:
                continue
            emm, ecm = e["specs"]
            pmm, pcm = p["specs"]
            if emm and pmm and emm != pmm:
                continue
            if ecm and pcm and ecm != pcm:
                continue
            raw = difflib.SequenceMatcher(None, e["base"], p["base"]).ratio()
            score = raw + (0.05 if emm and pmm else 0) + (0.05 if ecm and pcm else 0)
            if best is None or score > best[0]:
                best = (score, raw, p)
        if best and best[0] >= 0.90 and best[1] >= 0.86:
            seguros.append((e, best[2], "nombre", round(best[0], 2)))
        elif best and best[0] >= 0.72:
            dudosos.append((e, best[2], "dudoso", round(best[0], 2)))
        else:
            sin.append(e)
    return seguros, dudosos, sin


def fmt(value: float, decimals: int) -> str:
    if decimals == 0:
        return str(int(round(value)))
    return f"{round(value, decimals):.{decimals}f}".rstrip("0").rstrip(".")


def apply_prices(lines, seguros, decimals):
    """Reescribe retail/mayorista/empresario; devuelve (líneas, cambios)."""
    cambios = 0
    for entry, price, _kind, _score in seguros:
        fields = entry["lines"]
        indent = " " * 4
        if price["sugerido"] is not None and "retailPrice" in fields:
            lines[fields["retailPrice"]] = f"{indent}retailPrice: {fmt(price['sugerido'], decimals)},\n"
        nuevas = [f"{indent}mayoristaPrice: {fmt(price['mayorista'], decimals)},\n"]
        if price["empresario"] is not None:
            nuevas.append(f"{indent}empresarioPrice: {fmt(price['empresario'], decimals)},\n")
        for key in ("mayoristaPrice", "empresarioPrice"):
            if key in fields:
                lines[fields[key]] = None  # se reemplazan en bloque
        anchor = fields.get("compareAtPrice", fields.get("retailPrice"))
        lines[anchor] = lines[anchor] + "".join(nuevas)
        cambios += 1
    return [l for l in lines if l is not None], cambios


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("xlsx")
    ap.add_argument("pack")
    ap.add_argument("--apply", action="store_true", help="escribe el pack")
    ap.add_argument("--round", type=int, default=0, dest="decimals",
                    help="decimales del precio (0 para CLP/COP, 2 para USD/EUR)")
    args = ap.parse_args()

    prices = load_prices(Path(args.xlsx))
    lines, entries = load_pack(Path(args.pack))
    seguros, dudosos, sin = match(entries, prices)

    print(f"tabla: {len(prices)} filas · pack: {len(entries)} productos")
    print(f"match seguro: {len(seguros)} · dudoso: {len(dudosos)} · sin match: {len(sin)}")
    sin_sugerido = [e["title"] for e, p, _k, _s in seguros if p["sugerido"] is None]
    if sin_sugerido:
        print(f"\nsin DETAL SUGERIDO (se respeta el retail actual): {len(sin_sugerido)}")
        for t in sin_sugerido:
            print(f"  · {t}")
    if dudosos:
        print(f"\ndudosos — NO se tocan, revísalos a mano:")
        for e, p, _k, s in sorted(dudosos, key=lambda x: -x[3]):
            print(f"  {s:.2f}  {e['title'][:44]:46} ←→ {p['nombre']}")
    if sin:
        print(f"\nsin match — quedan con mayorista provisional (retail × 0.70):")
        for e in sin:
            print(f"  · {e['title']}")

    if not args.apply:
        print("\n(informe; usa --apply para escribir el pack)")
        return 0

    nuevas, cambios = apply_prices(lines, seguros, args.decimals)
    Path(args.pack).write_text("".join(nuevas))
    print(f"\n{cambios} productos actualizados en {args.pack}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
