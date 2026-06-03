#!/usr/bin/env python3
"""Generate players.json and schedule.json for the 2026 FIFA World Cup project."""
import json
import os
from itertools import combinations
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "app" / "data"

with open(DATA / "groups.json") as f:
    GROUPS = json.load(f)
with open(DATA / "teams.json") as f:
    TEAMS = json.load(f)

# ---------------------------------------------------------------------------
# Player roster generation
# ---------------------------------------------------------------------------
# Plausible names by region. These are fictional but linguistically appropriate.
# 26-player squads following FIFA 2026 expanded rule.

NAMES_BY_REGION = {
    "samerica": ["Silva","Santos","Souza","Garcia","Lopez","Martinez","Rodriguez","Gomez",
                 "Fernandez","Diaz","Sanchez","Pereira","Oliveira","Costa","Ramos","Castro",
                 "Vargas","Romero","Morales","Reyes","Cruz","Jimenez","Ortiz","Gutierrez",
                 "Alvarez","Mendoza","Aguilar","Flores","Vega","Torres"],
    "europe":   ["Mueller","Schmidt","Schneider","Fischer","Weber","Wagner","Becker","Hoffmann",
                 "Schulz","Koch","Bauer","Richter","Klein","Wolf","Schroeder","Neumann",
                 "Schwarz","Zimmermann","Braun","Krueger","Hartmann","Lange","Werner","Schmitt",
                 "Krause","Meier","Lehmann","Schmid","Schulze","Maier"],
    "english":  ["Smith","Jones","Taylor","Brown","Williams","Wilson","Johnson","Davies",
                 "Robinson","Wright","Thompson","Evans","Walker","White","Roberts","Green",
                 "Hall","Wood","Harris","Martin","Jackson","Clarke","Clark","Turner",
                 "Hill","Scott","Cooper","Morris","Ward","Watson"],
    "spanish":  ["Garcia","Martinez","Lopez","Sanchez","Perez","Gomez","Martin","Jimenez",
                 "Hernandez","Diaz","Moreno","Munoz","Alvarez","Romero","Alonso","Gutierrez",
                 "Navarro","Torres","Ruiz","Ramos","Ortega","Vega","Castro","Iglesias",
                 "Suarez","Marin","Cabrera","Velasco","Marquez","Pena"],
    "italy":    ["Rossi","Russo","Ferrari","Esposito","Bianchi","Romano","Colombo","Ricci",
                 "Marino","Greco","Bruno","Gallo","Conti","De Luca","Mancini","Costa",
                 "Giordano","Rizzo","Lombardi","Moretti","Barbieri","Fontana","Caruso","Mariani",
                 "Ferri","Galli","Martinelli","Leone","Longo","Gentile"],
    "scandi":   ["Hansen","Johansen","Olsen","Larsen","Andersen","Pedersen","Nielsen","Jensen",
                 "Kristiansen","Eriksen","Berg","Lund","Solberg","Haugen","Dahl","Bakken",
                 "Moen","Jakobsen","Kristensen","Madsen","Christiansen","Thomsen","Sorensen","Iversen",
                 "Ostergaard","Nordby","Vik","Lie","Strand","Aune"],
    "africa":   ["Diop","Diallo","Ba","Sow","Ndiaye","Toure","Sy","Cisse",
                 "Mbaye","Kone","Coulibaly","Sangare","Traore","Camara","Conde","Bamba",
                 "Fofana","Drogba","Gueye","Sane","Niang","Sarr","Mendy","Faye",
                 "Boateng","Asante","Mensah","Owusu","Adjei","Kwame"],
    "arab":     ["Al-Ali","Al-Saidi","Al-Otaibi","Al-Hamad","Al-Khalifa","Al-Najjar","Al-Mansoori","Hassan",
                 "Mahmoud","Mohamed","Ali","Said","Ibrahim","Karim","Salah","Youssef",
                 "Omar","Mostafa","Tarek","Ahmed","Khaled","Amine","Mehdi","Walid",
                 "Yassine","Hakim","Bouhaddouz","Boutaib","El Yamiq","Saiss"],
    "asia":     ["Kim","Lee","Park","Choi","Jung","Kang","Cho","Yoon",
                 "Han","Hwang","Suzuki","Tanaka","Sato","Yamamoto","Kobayashi","Watanabe",
                 "Ito","Nakamura","Kato","Yoshida","Hayashi","Sasaki","Yamada","Aoyama",
                 "Mori","Ono","Kim","Son","Hong","Hwang"],
    "oceania":  ["Wood","Smith","Brown","Wilson","Anderson","Taylor","Thomas","Reid",
                 "Wallace","Garcia","Allen","Lee","Walker","Young","King","Cook",
                 "Bennett","Davis","Edwards","Foster","Howard","Marshall","Mitchell","Nelson",
                 "Osman","Parker","Quinn","Russell","Stewart","Turner"],
    "central":  ["Hernandez","Lopez","Martinez","Gonzalez","Rodriguez","Perez","Sanchez","Ramirez",
                 "Cruz","Flores","Rivera","Gomez","Diaz","Reyes","Morales","Ortiz",
                 "Gutierrez","Chavez","Mendoza","Aguilar","Vargas","Castillo","Jimenez","Ruiz",
                 "Alvarez","Romero","Suarez","Torres","Garcia","Soto"],
    "balkans":  ["Modric","Kovacic","Brozovic","Perisic","Kramaric","Petkovic","Pjaca","Vlasic",
                 "Livakovic","Sosa","Erlic","Sutalo","Pongracic","Vida","Lovren","Gvardiol",
                 "Juranovic","Stanisic","Jakic","Sucic","Majer","Brekalo","Budimir","Halilovic",
                 "Pasalic","Vrsaljko","Caleta-Car","Skoric","Jedvaj","Mlakar"],
}

REGION_BY_TEAM = {
    "BRA":"samerica","ARG":"samerica","URU":"samerica","COL":"samerica","ECU":"samerica","PAR":"samerica",
    "GER":"europe","NED":"europe","BEL":"europe","AUT":"europe","SUI":"europe","POL":"europe","FRA":"europe","TUR":"europe",
    "ENG":"english","SCO":"english",
    "ESP":"spanish",
    "ITA":"italy",
    "POR":"spanish",
    "NOR":"scandi","DEN":"scandi",
    "MAR":"arab","ALG":"arab","TUN":"arab","EGY":"arab","KSA":"arab","JOR":"arab","IRQ":"arab","IRN":"arab",
    "SEN":"africa","CIV":"africa","GHA":"africa","CPV":"africa","RSA":"africa",
    "JPN":"asia","KOR":"asia","UZB":"asia","QAT":"arab",
    "AUS":"oceania","NZL":"oceania",
    "MEX":"central","USA":"english","CAN":"english","JAM":"central","HAI":"central","PAN":"central","CUW":"central",
    "CRO":"balkans",
}

CLUBS = {
    "samerica":["Flamengo","Palmeiras","Boca Juniors","River Plate","Sao Paulo","Atletico-MG",
                "Corinthians","Internacional","Gremio","Fluminense","Club America","Tigres",
                "Independiente","Penarol","Nacional","Liga Quito","Olimpia","Cerro Porteno",
                "LDU","Velez","Estudiantes","Botafogo","Santos","Bahia","Sport"],
    "europe":  ["Bayern Munich","Real Madrid","Barcelona","Manchester City","Liverpool","Arsenal",
                "Inter","AC Milan","Juventus","PSG","Atletico Madrid","Borussia Dortmund",
                "Chelsea","Tottenham","Manchester United","Napoli","Roma","Bayer Leverkusen",
                "Newcastle","Aston Villa","Marseille","Lyon","Sevilla","Benfica","Porto"],
    "english": ["Manchester City","Arsenal","Liverpool","Manchester United","Chelsea","Tottenham",
                "Newcastle","Aston Villa","Brighton","West Ham","Crystal Palace","Everton",
                "Wolves","Brentford","Fulham","Leicester","Leeds","Southampton","Bournemouth","Nottingham Forest"],
    "spanish": ["Real Madrid","Barcelona","Atletico Madrid","Sevilla","Real Sociedad","Athletic Bilbao",
                "Real Betis","Villarreal","Valencia","Celta","Getafe","Mallorca",
                "Osasuna","Girona","Las Palmas","Cadiz","Granada","Alaves","Rayo Vallecano","Almeria"],
    "italy":   ["Inter","Juventus","AC Milan","Napoli","Roma","Lazio",
                "Atalanta","Fiorentina","Bologna","Torino","Genoa","Empoli","Lecce","Sassuolo","Udinese","Salernitana"],
    "scandi":  ["Bodo/Glimt","Molde","Rosenborg","Brann","Viking","FC Copenhagen",
                "Brondby","FC Midtjylland","Malmo FF","AIK","IFK Goteborg","Hammarby"],
    "africa":  ["Al Ahly","Zamalek","ES Tunis","Mamelodi Sundowns","Wydad","Raja Casablanca",
                "TP Mazembe","Esperance","Pyramids","Simba SC","Kaizer Chiefs","Orlando Pirates"],
    "arab":    ["Al-Hilal","Al-Nassr","Al-Ittihad","Al-Ahli","Al-Sadd","Al-Duhail",
                "Al-Wakrah","Persepolis","Esteghlal","Sepahan","Al-Faisaly","Al-Wehdat",
                "Al-Quwa Al-Jawiya","Al-Shorta","Al-Zawraa","Tractor","Foolad","Pakhtakor"],
    "asia":    ["Ulsan Hyundai","Jeonbuk","FC Seoul","Pohang Steelers","Suwon Bluewings","Gangwon",
                "Urawa","Kawasaki Frontale","Yokohama F. Marinos","Vissel Kobe","Kashima","Cerezo Osaka",
                "Pakhtakor","Bunyodkor","AGMK"],
    "oceania": ["Auckland City","Wellington Phoenix","Sydney FC","Melbourne City","Western Sydney","Adelaide United",
                "Macarthur","Newcastle Jets","Brisbane Roar","Central Coast","Perth Glory"],
    "central": ["Club America","Cruz Azul","Tigres","Monterrey","Pumas","Chivas",
                "LD Alajuelense","Saprissa","Olimpia","Motagua","Pachuca","Atlas",
                "Toluca","Leon","Necaxa","Mazatlan","Queretaro","Juarez"],
    "balkans": ["Dinamo Zagreb","Hajduk Split","Rijeka","Osijek","Lokomotiva","Gorica","Slaven Belupo","Varazdin"],
}

def gen_squad(team_id):
    region = REGION_BY_TEAM.get(team_id, "europe")
    names = NAMES_BY_REGION[region]
    clubs = CLUBS[region] + CLUBS["europe"]  # mix in big European clubs since many internationals play there
    squad = []
    # Position layout: 3 GK, 9 DF, 8 MF, 6 FW = 26
    positions = ["GK"]*3 + ["DF"]*9 + ["MF"]*8 + ["FW"]*6
    for i, pos in enumerate(positions):
        number = i + 1
        # Use simple deterministic indexing so players differ per team
        seed = sum(ord(c) for c in team_id) + i
        name = names[seed % len(names)]
        club = clubs[(seed * 7) % len(clubs)]
        squad.append({
            "id": f"{team_id}-{number}",
            "number": number,
            "name": name,
            "position": pos,
            "club": club,
        })
    return squad

players = {tid: gen_squad(tid) for tid in TEAMS.keys()}

with open(DATA / "players.json", "w", encoding="utf-8") as f:
    json.dump(players, f, ensure_ascii=False, indent=2)
print(f"players.json: {len(players)} teams x 26 players")

# ---------------------------------------------------------------------------
# Schedule generation
# ---------------------------------------------------------------------------
# 72 group matches (12 groups x 6) + 32 knockout (16 R32 + 8 R16 + 4 QF + 2 SF + 1 third + 1 final)
# Group stage 2026-06-11 to 2026-06-27, 4 matches/day in 4 time slots roughly.

def group_matches():
    """Generate 6 round-robin matches per group."""
    out = []
    for group, teams in GROUPS.items():
        # Round-robin: all C(4,2) = 6 pairs
        pairs = list(combinations(teams, 2))
        # Distribute in 3 rounds (2 matches per round)
        rounds = [
            [(pairs[0][0], pairs[0][1]), (pairs[5][0], pairs[5][1])],
            [(pairs[1][0], pairs[1][1]), (pairs[4][0], pairs[4][1])],
            [(pairs[2][0], pairs[2][1]), (pairs[3][0], pairs[3][1])],
        ]
        for rnd, matches in enumerate(rounds, start=1):
            for h, a in matches:
                out.append((group, h, a, rnd))
    return out

# Venues (simplified — 16 host cities for 2026)
VENUES = [
    "Estadio Azteca, Mexico City",
    "BMO Field, Toronto",
    "BC Place, Vancouver",
    "GEHA Field at Arrowhead, Kansas City",
    "Lumen Field, Seattle",
    "Levi's Stadium, San Francisco Bay",
    "Sofi Stadium, Los Angeles",
    "AT&T Stadium, Dallas",
    "NRG Stadium, Houston",
    "Mercedes-Benz Stadium, Atlanta",
    "Hard Rock Stadium, Miami",
    "Lincoln Financial Field, Philadelphia",
    "Gillette Stadium, Boston",
    "MetLife Stadium, New York/New Jersey",
    "Estadio Akron, Guadalajara",
    "Estadio BBVA, Monterrey",
]

from datetime import datetime, timedelta, timezone

UTC = timezone.utc
schedule = []
match_id = 1

# Group stage: 18 days, 4 matches per day average
group_data = group_matches()
# Sort: round 1 of all groups first, then round 2, then round 3
group_data.sort(key=lambda x: (x[3], x[0]))
# 24 round-1 matches, 24 round-2, 24 round-3 = 72
# Spread round 1 over 6 days, round 2 over 6 days, round 3 over 6 days = 18 days
start = datetime(2026, 6, 11, tzinfo=UTC)
day = 0
slot_times = [16, 19, 22, 1]  # UTC hours, 4 slots
slot_index = 0
matches_today = 0

for group, home, away, rnd in group_data:
    hour = slot_times[slot_index % 4]
    if hour == 1:
        # next-day slot
        date = start + timedelta(days=day + 1)
    else:
        date = start + timedelta(days=day)
    match_time = date.replace(hour=hour, minute=0, second=0, microsecond=0)
    venue = VENUES[(match_id - 1) % len(VENUES)]
    schedule.append({
        "id": f"M{match_id:03d}",
        "homeTeamId": home,
        "awayTeamId": away,
        "group": group,
        "stage": "group",
        "matchTime": match_time.isoformat().replace("+00:00", "Z"),
        "venue": venue,
        "status": "pending",
    })
    match_id += 1
    matches_today += 1
    slot_index += 1
    if matches_today >= 4:
        matches_today = 0
        day += 1

# Knockout stages with placeholder team IDs
def knockout(stage, count, base_date_iso, win_prefix=None):
    global match_id
    out = []
    base_date = datetime.fromisoformat(base_date_iso).replace(tzinfo=UTC)
    for i in range(count):
        # Placeholder team IDs — will be resolved at runtime by knockout API
        if stage == "r32":
            home = f"{stage.upper()}-H{i+1}"
            away = f"{stage.upper()}-A{i+1}"
        else:
            home = f"{stage.upper()}-H{i+1}"
            away = f"{stage.upper()}-A{i+1}"
        match_time = base_date + timedelta(days=i // 2, hours=(i % 2) * 4)
        venue = VENUES[(match_id - 1) % len(VENUES)]
        out.append({
            "id": f"M{match_id:03d}",
            "homeTeamId": home,
            "awayTeamId": away,
            "stage": stage,
            "matchTime": match_time.isoformat().replace("+00:00", "Z"),
            "venue": venue,
            "status": "pending",
        })
        match_id += 1
    return out

schedule += knockout("r32",  16, "2026-06-29T16:00:00")
schedule += knockout("r16",   8, "2026-07-04T16:00:00")
schedule += knockout("qf",    4, "2026-07-09T20:00:00")
schedule += knockout("sf",    2, "2026-07-14T20:00:00")
schedule += knockout("third", 1, "2026-07-18T20:00:00")
schedule += knockout("final", 1, "2026-07-19T20:00:00")

print(f"schedule.json: {len(schedule)} matches")
assert len(schedule) == 104, f"Expected 104 matches, got {len(schedule)}"

with open(DATA / "schedule.json", "w", encoding="utf-8") as f:
    json.dump(schedule, f, ensure_ascii=False, indent=2)
print("Done.")
