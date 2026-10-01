"""Download one coherent BEA vintage. Validate XLSX before replacing cache."""
from __future__ import annotations
import hashlib
import re
import time
import urllib.request
import zipfile
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
URLS = {
    "underlying": "https://apps.bea.gov/national/Release/XLS/Underlying/Section2All_xls.xlsx",
    "nipa": "https://apps.bea.gov/national/Release/XLS/Survey/Section2All_xls.xlsx",
}

def download(kind: str, offline=False) -> Path:
    path = ROOT / "cache" / f"{kind}.xlsx"
    if offline:
        if not path.exists():
            raise FileNotFoundError(f"Missing {path}; run an online update first.")
        return path
    path.parent.mkdir(parents=True, exist_ok=True)
    last_error = None
    for attempt in range(3):
        temp = path.with_suffix(".tmp.xlsx")
        try:
            req = urllib.request.Request(URLS[kind], headers={"User-Agent": "us-pce-driver/1.0"})
            with urllib.request.urlopen(req, timeout=90) as response:
                temp.write_bytes(response.read())
            if not zipfile.is_zipfile(temp):
                raise ValueError(f"BEA returned something other than XLSX: {URLS[kind]}")
            workbook = openpyxl.load_workbook(temp, read_only=True, data_only=True)
            expected = "U20404-M" if kind == "underlying" else "T20808-M"
            if expected not in workbook.sheetnames:
                raise ValueError(f"Missing BEA sheet {expected}")
            workbook.close()
            temp.replace(path)
            return path
        except (OSError, ValueError, zipfile.BadZipFile) as exc:
            last_error = exc
            temp.unlink(missing_ok=True)
            time.sleep(attempt + 1)
    raise RuntimeError(f"BEA download failed; stale cache was NOT used: {last_error}")

def numeric(value):
    # BEA dots / blanks are unavailable, never zero.
    return float(value) if isinstance(value, (int, float)) else None

def read_table(workbook, sheet_name):
    rows = list(workbook[sheet_name].values)
    header = next(r for r in rows if str(r[0]).strip() == "Line")
    periods = {i: str(v)[:4] + "-" + str(v)[5:] for i, v in enumerate(header)
               if re.fullmatch(r"\d{4}M\d{2}", str(v))}
    if not periods:
        raise ValueError(f"Monthly header not found: {sheet_name}")
    table = {}
    for row in rows:
        if not str(row[0]).isdigit():
            continue
        line = int(row[0])
        if line in table:
            raise ValueError(f"Duplicate line {line} in {sheet_name}")
        raw = str(row[1])
        name = re.sub(r"\\\d+\\", "", raw.strip())
        name = re.sub(r"\s*\([^)]*\)\s*$", "", name)
        table[line] = {"name": name, "indent": len(raw)-len(raw.lstrip()),
                       "code": str(row[2]),
                       "values": {m: numeric(row[i]) for i, m in periods.items()}}
    return {"rows": table, "months": list(periods.values()),
            "published": str(rows[4][0]), "title": str(rows[0][0]),
            "units": str(rows[1][0])}

def fingerprint(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
