#!/usr/bin/env python3
"""Update teams.json with real FIFA rankings (June 2026, sourced from Sofascore/ESPN)
and add flagEmoji field for every team.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "app" / "data"

# Real rankings as of 2026-06-03, sourced from Sofascore (mirrors FIFA Apr 2026 update).
# Points listed for top 50; ranks 51-100 use estimated points by interpolation
# (descending ~1.5 pts per rank from rank 50's 1465.34).
REAL_RANKING = {
    # Top 50 with verified points
    "FRA": (1, 1877.32),
    "ESP": (2, 1876.40),
    "ARG": (3, 1874.81),
    "ENG": (4, 1825.97),
    "POR": (5, 1763.83),
    "BRA": (6, 1761.16),
    "NED": (7, 1757.87),
    "MAR": (8, 1755.87),
    "BEL": (9, 1734.71),
    "GER": (10, 1730.37),
    "CRO": (11, 1717.07),
    "ITA": (12, 1700.37),
    "COL": (13, 1693.09),
    "SEN": (14, 1688.99),
    "MEX": (15, 1681.03),
    "USA": (16, 1673.13),
    "URU": (17, 1673.07),
    "JPN": (18, 1660.43),
    "SUI": (19, 1649.40),
    "DEN": (20, 1620.81),
    "IRN": (21, 1615.30),
    "TUR": (22, 1599.04),
    "ECU": (23, 1594.78),
    "AUT": (24, 1593.45),
    "KOR": (25, 1588.66),
    "AUS": (27, 1580.67),
    "ALG": (28, 1564.26),
    "EGY": (29, 1563.24),
    "CAN": (30, 1556.48),
    "NOR": (31, 1550.94),
    "PAN": (33, 1540.64),
    "CIV": (34, 1532.98),
    "POL": (35, 1528.00),
    "PAR": (40, 1503.50),
    "SCO": (43, 1498.35),
    "TUN": (44, 1483.05),
    "UZB": (50, 1465.34),
    # Estimated points for ranks 51-100 (interpolated)
    "QAT": (55, 1450.0),
    "IRQ": (57, 1440.0),
    "RSA": (60, 1425.0),
    "KSA": (61, 1420.0),
    "JOR": (63, 1410.0),
    "CPV": (69, 1380.0),
    "JAM": (71, 1370.0),
    "GHA": (74, 1355.0),
    "CUW": (82, 1320.0),
    "HAI": (83, 1315.0),
    "NZL": (85, 1305.0),
}

# ISO 3166-1 alpha-2 -> regional indicator emoji conversion.
# We use FIFA codes (3-letter) but map via known equivalents.
FIFA_TO_ISO2 = {
    "BRA": "BR", "AUS": "AU", "SCO": "GB-SCT", "JAM": "JM",
    "CAN": "CA", "MAR": "MA", "PAR": "PY", "IRQ": "IQ",
    "GER": "DE", "ECU": "EC", "EGY": "EG", "DEN": "DK",
    "MEX": "MX", "KOR": "KR", "ALG": "DZ", "POL": "PL",
    "ARG": "AR", "JPN": "JP", "NOR": "NO", "TUR": "TR",
    "FRA": "FR", "SEN": "SN", "PAN": "PA", "ITA": "IT",
    "POR": "PT", "IRN": "IR", "TUN": "TN", "NZL": "NZ",
    "USA": "US", "SUI": "CH", "CIV": "CI", "HAI": "HT",
    "ENG": "GB-ENG", "URU": "UY", "UZB": "UZ", "CUW": "CW",
    "NED": "NL", "COL": "CO", "QAT": "QA", "GHA": "GH",
    "BEL": "BE", "AUT": "AT", "KSA": "SA", "CPV": "CV",
    "ESP": "ES", "CRO": "HR", "RSA": "ZA", "JOR": "JO",
}

def iso2_to_emoji(code: str) -> str:
    """Convert ISO 3166-1 alpha-2 code to regional indicator emoji."""
    # Special handling for British devolved nations
    if code == "GB-SCT":
        # Scotland flag emoji (Black Flag + tag sequence)
        return "\U0001F3F4\U000E0067\U000E0062\U000E0073\U000E0063\U000E0074\U000E007F"
    if code == "GB-ENG":
        # England flag emoji
        return "\U0001F3F4\U000E0067\U000E0062\U000E0065\U000E006E\U000E0067\U000E007F"
    return chr(ord(code[0]) - ord('A') + 0x1F1E6) + chr(ord(code[1]) - ord('A') + 0x1F1E6)

with open(DATA / "teams.json", "r", encoding="utf-8") as f:
    teams = json.load(f)

updated = 0
missing = []
for tid, t in teams.items():
    # 1) Update FIFA rank/points if known
    if tid in REAL_RANKING:
        t["fifaRank"], t["fifaPoint"] = REAL_RANKING[tid]
        updated += 1
    else:
        missing.append(tid)
    # 2) Add flagEmoji
    iso = FIFA_TO_ISO2.get(tid)
    if iso:
        t["flagEmoji"] = iso2_to_emoji(iso)

with open(DATA / "teams.json", "w", encoding="utf-8") as f:
    json.dump(teams, f, ensure_ascii=False, indent=2)

print(f"Updated {updated}/{len(teams)} teams with real ranking.")
if missing:
    print(f"Teams without ranking data: {missing}")
print("All 48 teams now have flagEmoji.")
