#!/usr/bin/env python3
"""Rebuild teams.json and schedule.json using official FIFA 2026 groups.
Based on NBC Sports confirmed schedule data.
"""
import json
from pathlib import Path
from datetime import datetime, timezone, timedelta

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "app" / "data"

# Official FIFA 2026 World Cup groups from NBC Sports schedule
# https://www.nbcsports.com/soccer/news/2026-world-cup-schedule-confirmed-dates-times-stadiums-full-details
OFFICIAL_GROUPS = {
    "A": ["MEX", "RSA", "KOR", "CZE"],  # Mexico, South Africa, South Korea, Czechia
    "B": ["CAN", "BIH", "QAT", "SUI"],  # Canada, Bosnia and Herzegovina, Qatar, Switzerland
    "C": ["BRA", "MAR", "HAI", "SCO"],  # Brazil, Morocco, Haiti, Scotland
    "D": ["USA", "PAR", "AUS", "TUR"],  # USA, Paraguay, Australia, Türkiye
    "E": ["GER", "CUW", "CIV", "ECU"],  # Germany, Curaçao, Ivory Coast, Ecuador
    "F": ["NED", "JPN", "SWE", "TUN"],  # Netherlands, Japan, Sweden, Tunisia
    "G": ["IRN", "NZL", "BEL", "EGY"],  # Iran, New Zealand, Belgium, Egypt
    "H": ["ESP", "CPV", "KSA", "URU"],  # Spain, Cape Verde, Saudi Arabia, Uruguay
    "I": ["FRA", "SEN", "IRQ", "NOR"],  # France, Senegal, Iraq, Norway
    "J": ["ARG", "ALG", "AUT", "JOR"],  # Argentina, Algeria, Austria, Jordan
    "K": ["POR", "COD", "UZB", "COL"],  # Portugal, DR Congo, Uzbekistan, Colombia
    "L": ["ENG", "CRO", "GHA", "PAN"],  # England, Croatia, Ghana, Panama
}

# Map common names to FIFA 3-letter codes (some need manual mapping)
NAME_TO_CODE = {
    "Bosnia and Herzegovina": "BIH",
    "Czechia": "CZE",
    "Czech Republic": "CZE",
    "Türkiye": "TUR",
    "Turkey": "TUR",
    "Ivory Coast": "CIV",
    "Côte d'Ivoire": "CIV",
    "Curaçao": "CUW",
    "Cape Verde": "CPV",
    "DR Congo": "COD",
    "Democratic Republic of Congo": "COD",
    "Congo DR": "COD",
}

# Load existing teams.json (has all ranking/emoji data)
with open(DATA / "teams.json", "r", encoding="utf-8") as f:
    existing_teams = json.load(f)

# Rebuild teams.json with official groups
new_teams = {}
for group_letter, team_codes in OFFICIAL_GROUPS.items():
    for code in team_codes:
        if code in existing_teams:
            t = existing_teams[code]
            t["group"] = group_letter
            new_teams[code] = t
        else:
            print(f"WARNING: Team {code} from official groups not found in existing teams.json")

# Verify we have exactly 48 teams
assert len(new_teams) == 48, f"Expected 48 teams, got {len(new_teams)}"

with open(DATA / "teams.json", "w", encoding="utf-8") as f:
    json.dump(new_teams, f, ensure_ascii=False, indent=2)

print(f"✓ Updated teams.json with official FIFA groups (48 teams across 12 groups)")

# Now rebuild schedule.json with official matchups
# Group stage: each group plays round-robin (6 matches per group, 72 total)
# Official schedule from NBC Sports with real venues and times
OFFICIAL_SCHEDULE = [
    # Group A
    {"date": "2026-06-11T19:00:00Z", "home": "MEX", "away": "RSA", "venue": "Estadio Azteca, Mexico City"},
    {"date": "2026-06-12T02:00:00Z", "home": "KOR", "away": "CZE", "venue": "Estadio Akron, Guadalajara"},
    {"date": "2026-06-18T16:00:00Z", "home": "CZE", "away": "RSA", "venue": "Mercedes-Benz Stadium, Atlanta"},
    {"date": "2026-06-19T01:00:00Z", "home": "MEX", "away": "KOR", "venue": "Estadio Akron, Guadalajara"},
    {"date": "2026-06-25T01:00:00Z", "home": "CZE", "away": "MEX", "venue": "Estadio Azteca, Mexico City"},
    {"date": "2026-06-25T01:00:00Z", "home": "RSA", "away": "KOR", "venue": "Estadio BBVA, Monterrey"},

    # Group B
    {"date": "2026-06-12T19:00:00Z", "home": "CAN", "away": "BIH", "venue": "BMO Field, Toronto"},
    {"date": "2026-06-13T19:00:00Z", "home": "QAT", "away": "SUI", "venue": "Levi's Stadium, San Francisco Bay Area"},
    {"date": "2026-06-18T19:00:00Z", "home": "SUI", "away": "BIH", "venue": "SoFi Stadium, Los Angeles"},
    {"date": "2026-06-18T22:00:00Z", "home": "CAN", "away": "QAT", "venue": "BC Place, Vancouver"},
    {"date": "2026-06-24T19:00:00Z", "home": "SUI", "away": "CAN", "venue": "BC Place, Vancouver"},
    {"date": "2026-06-24T19:00:00Z", "home": "BIH", "away": "QAT", "venue": "Lumen Field, Seattle"},

    # Group C
    {"date": "2026-06-13T22:00:00Z", "home": "BRA", "away": "MAR", "venue": "MetLife Stadium, New York/New Jersey"},
    {"date": "2026-06-14T01:00:00Z", "home": "HAI", "away": "SCO", "venue": "Gillette Stadium, Boston"},
    {"date": "2026-06-19T22:00:00Z", "home": "SCO", "away": "MAR", "venue": "Gillette Stadium, Boston"},
    {"date": "2026-06-20T01:00:00Z", "home": "BRA", "away": "HAI", "venue": "Lincoln Financial Field, Philadelphia"},
    {"date": "2026-06-24T22:00:00Z", "home": "SCO", "away": "BRA", "venue": "Hard Rock Stadium, Miami"},
    {"date": "2026-06-24T22:00:00Z", "home": "MAR", "away": "HAI", "venue": "Mercedes-Benz Stadium, Atlanta"},

    # Group D
    {"date": "2026-06-13T01:00:00Z", "home": "USA", "away": "PAR", "venue": "SoFi Stadium, Los Angeles"},
    {"date": "2026-06-13T04:00:00Z", "home": "AUS", "away": "TUR", "venue": "BC Place, Vancouver"},
    {"date": "2026-06-19T19:00:00Z", "home": "USA", "away": "AUS", "venue": "Lumen Field, Seattle"},
    {"date": "2026-06-20T04:00:00Z", "home": "TUR", "away": "PAR", "venue": "Levi's Stadium, San Francisco Bay Area"},
    {"date": "2026-06-26T02:00:00Z", "home": "TUR", "away": "USA", "venue": "SoFi Stadium, Los Angeles"},
    {"date": "2026-06-26T02:00:00Z", "home": "PAR", "away": "AUS", "venue": "Levi's Stadium, San Francisco Bay Area"},

    # Group E
    {"date": "2026-06-14T17:00:00Z", "home": "GER", "away": "CUW", "venue": "NRG Stadium, Houston"},
    {"date": "2026-06-14T23:00:00Z", "home": "CIV", "away": "ECU", "venue": "Lincoln Financial Field, Philadelphia"},
    {"date": "2026-06-20T20:00:00Z", "home": "GER", "away": "CIV", "venue": "BMO Field, Toronto"},
    {"date": "2026-06-21T00:00:00Z", "home": "ECU", "away": "CUW", "venue": "Arrowhead Stadium, Kansas City"},
    {"date": "2026-06-25T20:00:00Z", "home": "ECU", "away": "GER", "venue": "MetLife Stadium, New York/New Jersey"},
    {"date": "2026-06-25T20:00:00Z", "home": "CUW", "away": "CIV", "venue": "Lincoln Financial Field, Philadelphia"},

    # Group F
    {"date": "2026-06-14T20:00:00Z", "home": "NED", "away": "JPN", "venue": "AT&T Stadium, Dallas"},
    {"date": "2026-06-15T02:00:00Z", "home": "SWE", "away": "TUN", "venue": "Estadio BBVA, Monterrey"},
    {"date": "2026-06-20T17:00:00Z", "home": "NED", "away": "SWE", "venue": "NRG Stadium, Houston"},
    {"date": "2026-06-21T04:00:00Z", "home": "TUN", "away": "JPN", "venue": "Estadio BBVA, Monterrey"},
    {"date": "2026-06-25T23:00:00Z", "home": "JPN", "away": "SWE", "venue": "AT&T Stadium, Dallas"},
    {"date": "2026-06-25T23:00:00Z", "home": "TUN", "away": "NED", "venue": "Arrowhead Stadium, Kansas City"},

    # Group G
    {"date": "2026-06-16T01:00:00Z", "home": "IRN", "away": "NZL", "venue": "SoFi Stadium, Los Angeles"},
    {"date": "2026-06-15T19:00:00Z", "home": "BEL", "away": "EGY", "venue": "Lumen Field, Seattle"},
    {"date": "2026-06-21T19:00:00Z", "home": "BEL", "away": "IRN", "venue": "SoFi Stadium, Los Angeles"},
    {"date": "2026-06-22T01:00:00Z", "home": "NZL", "away": "EGY", "venue": "BC Place, Vancouver"},
    {"date": "2026-06-27T03:00:00Z", "home": "EGY", "away": "IRN", "venue": "Lumen Field, Seattle"},
    {"date": "2026-06-27T03:00:00Z", "home": "NZL", "away": "BEL", "venue": "BC Place, Vancouver"},

    # Group H
    {"date": "2026-06-15T16:00:00Z", "home": "ESP", "away": "CPV", "venue": "Mercedes-Benz Stadium, Atlanta"},
    {"date": "2026-06-15T22:00:00Z", "home": "KSA", "away": "URU", "venue": "Hard Rock Stadium, Miami"},
    {"date": "2026-06-21T16:00:00Z", "home": "ESP", "away": "KSA", "venue": "Mercedes-Benz Stadium, Atlanta"},
    {"date": "2026-06-21T22:00:00Z", "home": "URU", "away": "CPV", "venue": "Hard Rock Stadium, Miami"},
    {"date": "2026-06-27T00:00:00Z", "home": "CPV", "away": "KSA", "venue": "NRG Stadium, Houston"},
    {"date": "2026-06-27T00:00:00Z", "home": "URU", "away": "ESP", "venue": "Estadio Akron, Guadalajara"},

    # Group I
    {"date": "2026-06-16T19:00:00Z", "home": "FRA", "away": "SEN", "venue": "MetLife Stadium, New York/New Jersey"},
    {"date": "2026-06-16T22:00:00Z", "home": "IRQ", "away": "NOR", "venue": "Gillette Stadium, Boston"},
    {"date": "2026-06-22T21:00:00Z", "home": "FRA", "away": "IRQ", "venue": "Lincoln Financial Field, Philadelphia"},
    {"date": "2026-06-23T00:00:00Z", "home": "NOR", "away": "SEN", "venue": "MetLife Stadium, New York/New Jersey"},
    {"date": "2026-06-26T19:00:00Z", "home": "NOR", "away": "FRA", "venue": "Gillette Stadium, Boston"},
    {"date": "2026-06-26T19:00:00Z", "home": "SEN", "away": "IRQ", "venue": "BMO Field, Toronto"},

    # Group J
    {"date": "2026-06-17T01:00:00Z", "home": "ARG", "away": "ALG", "venue": "Arrowhead Stadium, Kansas City"},
    {"date": "2026-06-17T04:00:00Z", "home": "AUT", "away": "JOR", "venue": "Levi's Stadium, San Francisco Bay Area"},
    {"date": "2026-06-22T17:00:00Z", "home": "ARG", "away": "AUT", "venue": "AT&T Stadium, Dallas"},
    {"date": "2026-06-23T03:00:00Z", "home": "JOR", "away": "ALG", "venue": "Levi's Stadium, San Francisco Bay Area"},
    {"date": "2026-06-28T02:00:00Z", "home": "ALG", "away": "AUT", "venue": "Arrowhead Stadium, Kansas City"},
    {"date": "2026-06-28T02:00:00Z", "home": "JOR", "away": "ARG", "venue": "AT&T Stadium, Dallas"},

    # Group K
    {"date": "2026-06-17T17:00:00Z", "home": "POR", "away": "COD", "venue": "NRG Stadium, Houston"},
    {"date": "2026-06-18T02:00:00Z", "home": "UZB", "away": "COL", "venue": "Estadio Azteca, Mexico City"},
    {"date": "2026-06-23T17:00:00Z", "home": "POR", "away": "UZB", "venue": "NRG Stadium, Houston"},
    {"date": "2026-06-24T02:00:00Z", "home": "COL", "away": "COD", "venue": "Estadio Akron, Guadalajara"},
    {"date": "2026-06-27T23:30:00Z", "home": "COL", "away": "POR", "venue": "Hard Rock Stadium, Miami"},
    {"date": "2026-06-27T23:30:00Z", "home": "COD", "away": "UZB", "venue": "Mercedes-Benz Stadium, Atlanta"},

    # Group L
    {"date": "2026-06-17T20:00:00Z", "home": "ENG", "away": "CRO", "venue": "AT&T Stadium, Dallas"},
    {"date": "2026-06-17T23:00:00Z", "home": "GHA", "away": "PAN", "venue": "BMO Field, Toronto"},
    {"date": "2026-06-23T20:00:00Z", "home": "ENG", "away": "GHA", "venue": "Gillette Stadium, Boston"},
    {"date": "2026-06-23T23:00:00Z", "home": "PAN", "away": "CRO", "venue": "BMO Field, Toronto"},
    {"date": "2026-06-27T21:00:00Z", "home": "PAN", "away": "ENG", "venue": "MetLife Stadium, New York/New Jersey"},
    {"date": "2026-06-27T21:00:00Z", "home": "CRO", "away": "GHA", "venue": "Lincoln Financial Field, Philadelphia"},
]

# Load existing schedule (has knockout structure)
with open(DATA / "schedule.json", "r", encoding="utf-8") as f:
    old_schedule = json.load(f)

# Keep knockout matches, replace group matches
knockout = [m for m in old_schedule if m["stage"] != "group"]

# Generate new match IDs
new_schedule = []
match_num = 1

# Add official group stage matches
for entry in OFFICIAL_SCHEDULE:
    group = None
    for g, teams in OFFICIAL_GROUPS.items():
        if entry["home"] in teams and entry["away"] in teams:
            group = g
            break

    new_schedule.append({
        "id": f"M{match_num:03d}",
        "homeTeamId": entry["home"],
        "awayTeamId": entry["away"],
        "matchTime": entry["date"],
        "venue": entry["venue"],
        "group": group,
        "stage": "group",
        "status": "pending"
    })
    match_num += 1

# Add knockout matches (update match numbers)
for m in knockout:
    m["id"] = f"M{match_num:03d}"
    match_num += 1
    new_schedule.append(m)

with open(DATA / "schedule.json", "w", encoding="utf-8") as f:
    json.dump(new_schedule, f, ensure_ascii=False, indent=2)

print(f"✓ Generated schedule.json: {len(new_schedule)} matches (72 group + 32 knockout)")
print(f"✓ Group stage: Jun 11-27 | Knockout: Jun 28 - Jul 19")
