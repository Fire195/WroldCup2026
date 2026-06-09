#!/usr/bin/env python3
"""Download all 48 World Cup flags from flagcdn.com as SVG."""
import urllib.request
import os
import sys

FLAG_MAP = {
    "BRA": "br", "AUS": "au", "SCO": "gb-sct", "JAM": "jm",
    "CAN": "ca", "MAR": "ma", "PAR": "py", "IRQ": "iq",
    "GER": "de", "ECU": "ec", "EGY": "eg", "DEN": "dk",
    "MEX": "mx", "KOR": "kr", "ALG": "dz", "POL": "pl",
    "ARG": "ar", "JPN": "jp", "NOR": "no", "TUR": "tr",
    "FRA": "fr", "SEN": "sn", "PAN": "pa", "ITA": "it",
    "POR": "pt", "IRN": "ir", "TUN": "tn", "NZL": "nz",
    "USA": "us", "SUI": "ch", "CIV": "ci", "HAI": "ht",
    "ENG": "gb-eng", "URU": "uy", "UZB": "uz", "CUW": "cw",
    "NED": "nl", "COL": "co", "QAT": "qa", "GHA": "gh",
    "BEL": "be", "AUT": "at", "KSA": "sa", "CPV": "cv",
    "ESP": "es", "CRO": "hr", "RSA": "za", "JOR": "jo",
}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "flags")
os.makedirs(OUT_DIR, exist_ok=True)

ok, fail = 0, []
for tla, iso in FLAG_MAP.items():
    url = f"https://flagcdn.com/{iso}.svg"
    out = os.path.join(OUT_DIR, f"{tla}.svg")
    try:
        urllib.request.urlretrieve(url, out)
        size = os.path.getsize(out)
        if size < 100:
            raise ValueError(f"file too small ({size} bytes)")
        ok += 1
    except Exception as e:
        fail.append((tla, iso, str(e)))

print(f"Downloaded {ok}/{len(FLAG_MAP)} flags")
if fail:
    print("Failures:")
    for t, i, e in fail:
        print(f"  {t} ({i}): {e}")
    sys.exit(1)
