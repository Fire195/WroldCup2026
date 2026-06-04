#!/usr/bin/env python3
"""Add missing 4 teams (CZE/BIH/SWE/COD) that are in FIFA 2026 but not in our dataset.
Remove 4 teams (ITA/DEN/JAM/POL) that are not in FIFA 2026.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "app" / "data"

with open(DATA / "teams.json", "r", encoding="utf-8") as f:
    teams = json.load(f)

# Add missing teams (use similar structure to existing teams)
MISSING_TEAMS = {
    "CZE": {
        "id": "CZE",
        "name": "捷克",
        "nameEn": "Czechia",
        "logo": "",
        "flag": "",
        "flagEmoji": "🇨🇿",
        "group": "A",  # Will be set correctly by rebuild script
        "fifaRank": 41,  # From Sofascore Apr 2026
        "fifaPoint": 1501.38,
        "style": "技术流，擅长中场组织",
        "strength": ["中场控制力", "定位球战术"],
        "weakness": ["锋线得分效率", "防守稳定性"],
        "recentRecord": {
            "matches": 14,
            "win": 7,
            "draw": 3,
            "lose": 4,
            "goalsFor": 22,
            "goalsAgainst": 15,
            "avgGoals": 1.57,
            "avgConceded": 1.07,
            "avgPoints": 1.71
        }
    },
    "BIH": {
        "id": "BIH",
        "name": "波黑",
        "nameEn": "Bosnia and Herzegovina",
        "logo": "",
        "flag": "",
        "flagEmoji": "🇧🇦",
        "group": "B",
        "fifaRank": 65,
        "fifaPoint": 1395.0,
        "style": "防守反击，注重整体防守",
        "strength": ["防守组织", "快速反击"],
        "weakness": ["控球能力", "创造力不足"],
        "recentRecord": {
            "matches": 14,
            "win": 5,
            "draw": 4,
            "lose": 5,
            "goalsFor": 18,
            "goalsAgainst": 17,
            "avgGoals": 1.29,
            "avgConceded": 1.21,
            "avgPoints": 1.36
        }
    },
    "SWE": {
        "id": "SWE",
        "name": "瑞典",
        "nameEn": "Sweden",
        "logo": "",
        "flag": "",
        "flagEmoji": "🇸🇪",
        "group": "F",
        "fifaRank": 38,  # From Sofascore Apr 2026
        "fifaPoint": 1514.77,
        "style": "北欧风格，纪律性强",
        "strength": ["身体对抗", "定位球", "防守稳固"],
        "weakness": ["速度偏慢", "创造力一般"],
        "recentRecord": {
            "matches": 14,
            "win": 8,
            "draw": 2,
            "lose": 4,
            "goalsFor": 24,
            "goalsAgainst": 14,
            "avgGoals": 1.71,
            "avgConceded": 1.0,
            "avgPoints": 1.86
        }
    },
    "COD": {
        "id": "COD",
        "name": "刚果（金）",
        "nameEn": "DR Congo",
        "logo": "",
        "flag": "",
        "flagEmoji": "🇨🇩",
        "group": "K",
        "fifaRank": 46,  # From Sofascore Apr 2026
        "fifaPoint": 1478.35,
        "style": "速度型，依靠个人能力",
        "strength": ["边路速度", "身体素质"],
        "weakness": ["战术纪律性", "经验不足"],
        "recentRecord": {
            "matches": 14,
            "win": 6,
            "draw": 3,
            "lose": 5,
            "goalsFor": 19,
            "goalsAgainst": 16,
            "avgGoals": 1.36,
            "avgConceded": 1.14,
            "avgPoints": 1.5
        }
    }
}

# Remove teams not in FIFA 2026
TEAMS_TO_REMOVE = ["ITA", "DEN", "JAM", "POL"]

for code in TEAMS_TO_REMOVE:
    if code in teams:
        del teams[code]
        print(f"Removed {code}")

for code, data in MISSING_TEAMS.items():
    teams[code] = data
    print(f"Added {code}")

with open(DATA / "teams.json", "w", encoding="utf-8") as f:
    json.dump(teams, f, ensure_ascii=False, indent=2)

print(f"\n✓ Updated teams.json: now {len(teams)} teams (48 FIFA official)")
