#!/usr/bin/env python3
"""Parse precios mayoristas xlsx → JSON por hoja. Uso: python3 _parse_mayoristas_xlsx.py path.xlsx"""
import json, re, sys, unicodedata, zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def col_row(ref: str):
    m = re.match(r"([A-Z]+)(\d+)", ref)
    return m.group(1), int(m.group(2))


def col_to_idx(col: str) -> int:
    n = 0
    for c in col:
        n = n * 26 + (ord(c) - 64)
    return n - 1


def norm(s: str) -> str:
    if not s:
        return ""
    s = s.lower().strip()
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    for a, b in [
        (r"\bd\.\s*", "dije "),
        (r"\bc\.\s*", "cadena "),
        (r"\bp\.\s*", "pulsera "),
        (r"\bt\.\s*", "topo "),
        (r"\bcrus\b", "cruz"),
        (r"\bcartier\b", "carter"),
    ]:
        s = re.sub(a, b, s)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    stop = {"de", "la", "el", "los", "las", "y", "con", "para", "en", "del", "copia"}
    return " ".join(t for t in s.split() if t not in stop)


def main():
    path = Path(sys.argv[1])
    with zipfile.ZipFile(path) as z:
        shared = []
        root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in root.findall("m:si", NS):
            shared.append("".join(t.text or "" for t in si.findall(".//m:t", NS)))
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        sheets = []
        for sh in wb.findall("m:sheets/m:sheet", NS):
            sheets.append(
                (
                    sh.attrib["name"],
                    sh.attrib[
                        "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
                    ],
                )
            )
        rid = {
            rel.attrib["Id"]: rel.attrib["Target"]
            for rel in ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        }
        out = {}
        for name, rid_ in sheets:
            if name == "NUEVAS REFERENCIAS":
                continue
            target = rid[rid_]
            if not target.startswith("xl/"):
                target = "xl/" + target.lstrip("/")
            root = ET.fromstring(z.read(target))
            rows = defaultdict(dict)
            for c in root.findall(".//m:sheetData/m:row/m:c", NS):
                col, row = col_row(c.attrib["r"])
                t = c.attrib.get("t")
                v = c.find("m:v", NS)
                if v is None or v.text is None:
                    val = None
                elif t == "s":
                    val = shared[int(v.text)]
                else:
                    try:
                        val = (
                            float(v.text)
                            if ("." in v.text or "e" in v.text.lower())
                            else int(v.text)
                        )
                    except Exception:
                        val = v.text
                rows[row][col_to_idx(col)] = val
            data = []
            for r in range(2, max(rows) + 1):
                sku = rows[r].get(0)
                if sku is None:
                    continue
                sku_s = (
                    str(int(sku))
                    if isinstance(sku, (int, float)) and float(sku).is_integer()
                    else str(sku).strip()
                )
                nombre = str(rows[r].get(1) or "").strip()
                may = rows[r].get(3) if name in ("CHILE", "COLOMBIA") else rows[r].get(5)
                if may is None:
                    continue
                data.append(
                    {
                        "sku": sku_s,
                        "nombre": nombre,
                        "mayorista": float(may),
                        "n": norm(nombre),
                    }
                )
            out[name] = data
        print(json.dumps(out))


if __name__ == "__main__":
    main()
