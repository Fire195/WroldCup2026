# 2026 FIFA World Cup Prediction Platform — Design Spec

**Date:** 2026-06-03  
**Stack:** Nuxt 4 · Vue 3.5 · Pinia · TailwindCSS · TypeScript (strict) · Vercel

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Vercel (Hobby Free)               │
│                                                     │
│  ┌──────────────┐    ┌──────────────────────────┐   │
│  │  Nuxt 4 SSR  │    │     Nitro Server API      │   │
│  │  /app/pages  │◄──►│  /server/api/*            │   │
│  └──────────────┘    │  /server/cron/sync.ts     │   │
│                      └────────────┬─────────────┘   │
│  ┌──────────────┐                 │                  │
│  │  Vercel KV   │◄────────────────┘                  │
│  │  (cache)     │         Football-Data.org API       │
│  └──────────────┘              (free tier)           │
└─────────────────────────────────────────────────────┘
```

**Data flow:**
1. Static base data (teams, players, groups, schedule) → bundled as local JSON in `/app/data/`
2. Vercel Cron Job triggers `POST /api/sync` ~105 min after each day's last match ends
3. Nitro fetches match results from Football-Data.org → stores in Vercel KV
4. Pages read merged data: local JSON + KV overlay; KV values override local stubs
5. On result write, server recalculates group standings and championship probabilities

---

## 2. Data Strategy

### 2.1 Local JSON (one-time authored, `/app/data/`)

| File | Content |
|---|---|
| `teams.json` | All 48 teams: id, name, logo, flag, group, fifaRank, fifaPoint, style, strength[], weakness[], members[], recentRecord |
| `groups.json` | Groups A–L (12 groups, 4 teams each), team IDs per group |
| `schedule.json` | All 104 matches: id, homeTeam, awayTeam, group, stage, matchTime (ISO), venue |
| `players.json` | Full squads per team: number, name, position, club |
| `recentRecords.json` | Past-12-month stats per team (matches, W/D/L, GF/GA, avg goals, avg conceded, avg points). **Source: user-provided dataset (2025.6–2026.5).** Imported once, never auto-updated until tournament end. |

**Group assignments (官方分组, A–L):**
- A: 巴西、澳大利亚、苏格兰、牙买加
- B: 加拿大、摩洛哥、巴拉圭、伊拉克
- C: 德国、厄瓜多尔、埃及、丹麦
- D: 墨西哥、韩国、阿尔及利亚、波兰
- E: 阿根廷、日本、挪威、土耳其
- F: 法国、塞内加尔、巴拿马、意大利
- G: 葡萄牙、伊朗、突尼斯、新西兰
- H: 美国、瑞士、科特迪瓦、海地
- I: 英格兰、乌拉圭、乌兹别克斯坦、库拉索
- J: 荷兰、哥伦比亚、卡塔尔、加纳
- K: 比利时、奥地利、沙特阿拉伯、佛得角
- L: 西班牙、克罗地亚、南非、约旦

### 2.2 Runtime KV (Vercel KV, auto-populated)

| Key pattern | Value |
|---|---|
| `match:{id}` | `{ status, homeScore, awayScore }` |
| `standings:{group}` | computed group table |
| `champion_rates` | `{ [teamId]: number }` map |

### 2.3 API Source

**Football-Data.org** (Tier 1, free forever, no daily cap, 10 req/min)
- Endpoint: `GET /v4/competitions/WC/matches?matchday={n}`
- Auth: `X-Auth-Token` header (env var `FOOTBALL_DATA_API_KEY`)

---

## 3. Module Design

### 3.1 Team Info Module (`/teams/[id]`)

Displays full team profile assembled from local JSON + KV `champion_rates`.

Components:
- `TeamCard.vue` — logo, flag, FIFA rank, group badge, style tag
- `SquadTable.vue` — squad list (number / name / position / club)
- `RecordStats.vue` — recent 12-month W/D/L/GF/GA bar chart
- `StrengthWeakness.vue` — strength[] / weakness[] tag lists
- `ChampionRateBadge.vue` — live probability % with trend indicator

### 3.2 Group Stage Module (`/groups/[group]`)

Reads `groups.json` + KV `standings:{group}` + KV `match:{id}` for status.

Components:
- `GroupTable.vue` — live standings: P/W/D/L/GD/GF/Pts, top-2 highlighted
- `MatchList.vue` — per-round fixtures with status chip (pending / live / ended) and score
- `QualifyChance.vue` — visual qualification probability bars (derived from standings)

### 3.3 Match Prediction Module (`/matches/[id]`)

Fully computed on server at request time; no external data needed.

Components:
- `RecentFormCompare.vue` — side-by-side recent 12-month form: matches, W/D/L, GF/GA, avg points (data from `recentRecords.json`); rendered as parallel bar charts
- `ProbabilityBar.vue` — home win / draw / away win %
- `PredictedScore.vue` — most likely scoreline + confidence index
- `KeyFactors.vue` — weighted factor breakdown (see §5)

### 3.4 Knockout Module (`/knockout`)

Tree rendered from `schedule.json` (stage: 16/8/4/semi/final) + KV match results.

Components:
- `KnockoutTree.vue` — SVG bracket, 16→8→4→SF→F, losers greyed out
- `ChampionLeaderboard.vue` — sorted live championship probability list
- `ProbabilityTrend.vue` — sparkline of probability changes per team across rounds

### 3.5 Home Page (`/`)

- Today's matches (from schedule + KV status)
- Top-5 championship probability widget
- Latest completed match results

### 3.6 Stats Module (`/stats`) — incremental

- Top scorers, assists, yellow/red cards
- Data source: Football-Data.org `/v4/competitions/WC/scorers`

---

## 4. Server API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/teams` | GET | Return all teams merged with KV champion_rates |
| `/api/matches` | GET | Return all matches merged with KV results |
| `/api/matches/[id]` | GET | Single match + prediction payload |
| `/api/groups/[group]` | GET | Group fixtures + live standings |
| `/api/knockout` | GET | Knockout bracket + champion probabilities |
| `/api/sync` | POST | Cron trigger: fetch results, update KV, recalc probabilities |

All routes are Nitro server routes (`/server/api/`). No client-side direct calls to Football-Data.org.

---

## 5. Prediction Algorithm

### 5.1 Single Match (Win/Draw/Loss)

Weighted score per team (0–100):

| Factor | Weight | Source |
|---|---|---|
| FIFA rank (inverted, normalized) | 25% | `teams.json` |
| Recent 12-month win rate | 25% | `teams.json` recentRecord |
| Attack/defense ratio (GF/GA) | 20% | `teams.json` recentRecord |
| Current group stage performance | 15% | KV standings |
| Squad completeness (proxy: squad size) | 15% | `players.json` |

Score diff → sigmoid → home win %, away win %; remainder split as draw %.
Predicted score: map win probability to expected goals (Poisson-approximated lookup table).

Implementation: `/app/utils/predictAlgorithm.ts` (pure function, no I/O)

### 5.2 Championship Probability

Computed server-side after each result sync (`/app/utils/probabilityCalc.ts`):

```
championRate(team) =
  attackDefenseIndex × 0.30
  + recentFormIndex   × 0.25
  + rankCoefficient   × 0.20
  + remainingScheduleDifficulty × 0.15  (inverted)
  + majorTournamentExperience   × 0.10
```

Normalized so all remaining teams sum to 100%. Eliminated teams → 0%.

---

## 6. Cron Sync Strategy

Vercel Cron (`vercel.json`):
- Schedule: run daily at `02:00`, `09:00`, `14:00`, `22:00` UTC (covers all match windows globally)
- `POST /api/sync` checks schedule for matches that ended in the past 2 hours, fetches results, writes KV, triggers probability recalc
- Rate: ~4 calls/day to Football-Data.org well within free tier

Fallback: any admin can manually `POST /api/sync` to force refresh.

---

## 7. State Management (Pinia)

| Store | State | Notes |
|---|---|---|
| `teamStore` | teams[], championRates | hydrated from `/api/teams` on app init |
| `matchStore` | matches[], currentMatchday | hydrated from `/api/matches` |
| `uiStore` | theme (light/dark), activeGroup | persisted to localStorage |

---

## 8. Deployment

```
GitHub repo
  └── push to main
        └── Vercel auto-deploy
              ├── nuxt build (SSR mode)
              ├── Vercel KV (free: 256 MB storage, 3000 req/day read)
              └── Cron Jobs (free: 2 jobs max on Hobby)
```

Env vars required:
- `FOOTBALL_DATA_API_KEY` — Football-Data.org token
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` — Vercel KV (auto-injected)

---

## 9. Directory Structure

```
/app
  /components
    TeamCard.vue · SquadTable.vue · RecordStats.vue
    GroupTable.vue · MatchList.vue · KnockoutTree.vue
    ProbabilityBar.vue · PredictedScore.vue · ChampionLeaderboard.vue
    RecentFormCompare.vue
  /pages
    index.vue
    teams/[id].vue
    groups/[group].vue
    matches/[id].vue
    knockout.vue
    stats.vue
  /composables
    useTeams.ts · useMatches.ts · usePredict.ts
  /stores
    teamStore.ts · matchStore.ts · uiStore.ts
  /utils
    predictAlgorithm.ts · probabilityCalc.ts
  /data
    teams.json · players.json · groups.json · schedule.json
/server
  /api
    teams.ts · matches.ts · matches/[id].ts
    groups/[group].ts · knockout.ts · sync.ts
  /utils
    kvClient.ts · footballDataClient.ts
/public
  /logos · /flags
nuxt.config.ts
vercel.json
```

---

## 10. Error Handling & Edge Cases

- Football-Data.org returns 429: sync silently skips, retries on next cron tick
- KV read fails: fall back to local JSON stubs (score = null, status = pending)
- Match not yet in API (pre-tournament): status = pending, no score shown
- All 48 teams present in local JSON at launch; KV only used for live overrides
- Probability calc with 0 remaining matches (final played): show final winner at 100%

---

## 11. Mobile / Responsive Strategy

**Target devices:** iPhone SE (375px) → iPad (1024px) → Desktop (1280px+). Mobile-first design throughout.

**Tailwind breakpoints used:**
- `< 640px` (default) — phone portrait
- `sm: 640px+` — phone landscape / small tablet
- `md: 768px+` — tablet portrait
- `lg: 1024px+` — tablet landscape / desktop

**Component-specific mobile handling:**

| Component | Desktop | Mobile (`< 640px`) |
|---|---|---|
| `KnockoutTree.vue` | Horizontal SVG bracket, all 7 rounds visible | Vertical stacked layout: one round per screen, swipe between rounds; `<2xl` falls back to horizontal scroll with momentum |
| `GroupTable.vue` | Full table P/W/D/L/GD/GF/GA/Pts | Compact: only Team / W-D-L / Pts visible; tap row expands details |
| `MatchList.vue` | Multi-column grid (3 per row) | Single-column card list, larger tap targets |
| `ProbabilityBar.vue` | Side-by-side bars with labels | Stacked horizontal bar, percentages below |
| `RecentFormCompare.vue` | Side-by-side parallel charts | Stacked vertical, team names above each block |
| `ProbabilityTrend.vue` | Line chart with hover tooltips | Touch-tap reveals tooltip; pinch-to-zoom on time axis |
| Navigation | Top horizontal nav | Bottom tab bar (Home / Groups / Knockout / Stats) — thumb-reachable |
| `SquadTable.vue` | Full 4-column table | Card list per player; jersey number prominent |

**Touch interaction:**
- Minimum 44×44px tap targets (Apple HIG / Material Design)
- Hover-only interactions converted to tap or long-press equivalents
- Use `touch-action: pan-y` on knockout bracket to prevent accidental horizontal scroll

**Performance budget for mobile:**
- LCP < 2.5s on 4G
- Total JS payload < 200KB gzipped (Nuxt 4 + Vue 3.5 baseline ~80KB)
- All team logos / flags served as WebP, lazy-loaded below the fold
- SVG sprites for icons, no icon font

**Verification:**
- Test in Chrome DevTools device emulator: iPhone SE, iPhone 14 Pro, Pixel 7, iPad
- Real-device smoke test on iOS Safari + Android Chrome before launch
- Lighthouse mobile score target: Performance ≥ 90, Accessibility ≥ 95

---

## 12. Phased Feature Status

| Feature | Phase |
|---|---|
| Team profiles, squad, analysis | P0 (launch) |
| Group stage schedule + standings | P0 (launch) |
| Single match prediction | P0 (launch) |
| Knockout bracket + champion rates | P0 (launch) |
| Light/dark theme | P0 (launch) |
| Stats leaderboards (scorers etc.) | P1 (post-kickoff) |
| Probability trend charts | P1 (post-kickoff) |
| Real-time push notifications | P2 (optional) |

All P0 features are in scope for this implementation plan.
