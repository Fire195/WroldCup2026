#!/usr/bin/env python3
"""Update schedule.json with realistic match times and real venues
from the 2026 FIFA World Cup official schedule.
Keeps our custom group assignments and pairings intact.
"""
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "app" / "data"

with open(DATA / "schedule.json", "r", encoding="utf-8") as f:
    schedule = json.load(f)

# Real 16 venues from the 2026 World Cup
VENUES = [
    "Estadio Azteca, Mexico City",
    "Estadio Akron, Guadalajara",
    "Estadio BBVA, Monterrey",
    "MetLife Stadium, New York/New Jersey",
    "SoFi Stadium, Los Angeles",
    "AT&T Stadium, Dallas",
    "NRG Stadium, Houston",
    "Hard Rock Stadium, Miami",
    "Lumen Field, Seattle",
    "Levi's Stadium, San Francisco Bay Area",
    "Mercedes-Benz Stadium, Atlanta",
    "Gillette Stadium, Boston",
    "Lincoln Financial Field, Philadelphia",
    "BC Place, Vancouver",
    "BMO Field, Toronto",
    "Arrowhead Stadium, Kansas City",
]

UTC = timezone.utc

# Group stage: June 11 - June 27, 4 matches/day across 4 time slots (ET→UTC)
# Realistic ET kickoff times: 1pm, 4pm, 7pm, 10pm → UTC 17:00, 20:00, 23:00, 02:00(+1)
GROUP_SLOTS_UTC = [17, 20, 23, 2]  # hours UTC (2 is next day)

# Distribute 72 group matches over 17 days (Jun 11 - Jun 27)
# ~4.2 matches/day average; real WC does 4 per day
start_date = datetime(2026, 6, 11, tzinfo=UTC)
group_matches = [m for m in schedule if m["stage"] == "group"]

day = 0
slot_idx = 0
for i, m in enumerate(group_matches):
    hour = GROUP_SLOTS_UTC[slot_idx % 4]
    if hour == 2:
        dt = start_date + timedelta(days=day + 1)
    else:
        dt = start_date + timedelta(days=day)
    m["matchTime"] = dt.replace(hour=hour, minute=0, second=0).isoformat().replace("+00:00", "Z")
    m["venue"] = VENUES[i % len(VENUES)]
    slot_idx += 1
    if slot_idx % 4 == 0:
        day += 1

# Knockout: real dates from official schedule
# R32: Jun 28 - Jul 3 (16 matches, ~3/day)
r32 = [m for m in schedule if m["stage"] == "r32"]
r32_start = datetime(2026, 6, 28, tzinfo=UTC)
for i, m in enumerate(r32):
    day_offset = i // 3
    slot = i % 3
    hours = [17, 20, 23]
    dt = r32_start + timedelta(days=day_offset)
    m["matchTime"] = dt.replace(hour=hours[slot], minute=0).isoformat().replace("+00:00", "Z")
    m["venue"] = VENUES[i % len(VENUES)]

# R16: Jul 4-7 (8 matches, 2/day)
r16 = [m for m in schedule if m["stage"] == "r16"]
r16_start = datetime(2026, 7, 4, tzinfo=UTC)
for i, m in enumerate(r16):
    day_offset = i // 2
    slot = i % 2
    hours = [19, 23]
    dt = r16_start + timedelta(days=day_offset)
    m["matchTime"] = dt.replace(hour=hours[slot], minute=0).isoformat().replace("+00:00", "Z")
    m["venue"] = VENUES[i % len(VENUES)]

# QF: Jul 9-11 (4 matches)
qf = [m for m in schedule if m["stage"] == "qf"]
qf_dates = [
    (datetime(2026, 7, 9, 20, 0, tzinfo=UTC), "Gillette Stadium, Boston"),
    (datetime(2026, 7, 10, 19, 0, tzinfo=UTC), "SoFi Stadium, Los Angeles"),
    (datetime(2026, 7, 11, 21, 0, tzinfo=UTC), "Hard Rock Stadium, Miami"),
    (datetime(2026, 7, 11, 1, 0, tzinfo=UTC), "Arrowhead Stadium, Kansas City"),
]
for i, m in enumerate(qf):
    dt, venue = qf_dates[i]
    m["matchTime"] = dt.isoformat().replace("+00:00", "Z")
    m["venue"] = venue

# SF: Jul 14-15
sf = [m for m in schedule if m["stage"] == "sf"]
sf_dates = [
    (datetime(2026, 7, 14, 19, 0, tzinfo=UTC), "AT&T Stadium, Dallas"),
    (datetime(2026, 7, 15, 19, 0, tzinfo=UTC), "Mercedes-Benz Stadium, Atlanta"),
]
for i, m in enumerate(sf):
    dt, venue = sf_dates[i]
    m["matchTime"] = dt.isoformat().replace("+00:00", "Z")
    m["venue"] = venue

# Third place: Jul 18
third = [m for m in schedule if m["stage"] == "third"]
for m in third:
    m["matchTime"] = "2026-07-18T21:00:00Z"
    m["venue"] = "Hard Rock Stadium, Miami"

# Final: Jul 19
final = [m for m in schedule if m["stage"] == "final"]
for m in final:
    m["matchTime"] = "2026-07-19T19:00:00Z"
    m["venue"] = "MetLife Stadium, New York/New Jersey"

with open(DATA / "schedule.json", "w", encoding="utf-8") as f:
    json.dump(schedule, f, ensure_ascii=False, indent=2)

print(f"Updated {len(schedule)} matches with real venues and realistic times.")
print(f"Group: Jun 11-27 | R32: Jun 28-Jul 3 | R16: Jul 4-7 | QF: Jul 9-11 | SF: Jul 14-15 | 3rd: Jul 18 | F: Jul 19")
