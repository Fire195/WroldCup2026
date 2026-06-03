# 2026 FIFA World Cup Prediction Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Nuxt 4 web app showing 2026 World Cup teams, group standings, single-match predictions, and a knockout bracket with live championship probabilities. Auto-syncs match results from Football-Data.org free tier; mobile-first responsive.

**Architecture:** Nuxt 4 SSR on Vercel Hobby. Static team/squad/schedule data in local JSON. Match results pulled by Vercel Cron into Vercel KV. Server API merges JSON+KV. Pure-function predictors in `/app/utils/` are unit-tested with Vitest.

**Tech Stack:** Nuxt 4 · Vue 3.5 · TypeScript (strict) · Pinia · TailwindCSS · Vitest · @vercel/kv · Vercel Cron Jobs

---

## File Structure

```
/app
  /components/...        # 14 Vue components
  /pages/...             # 6 page routes
  /composables/...       # 3 composables
  /stores/...            # 3 Pinia stores
  /utils/                # PURE functions, fully unit-tested
    predictAlgorithm.ts
    probabilityCalc.ts
    standingsCalc.ts
  /types/index.ts        # All shared TS interfaces
  /data/                 # Static JSON, hand-authored
    teams.json · players.json · groups.json
    schedule.json · recentRecords.json
/server
  /api/                  # Nitro routes (server-only)
  /utils/                # footballDataClient, kvClient
/tests/                  # Vitest unit tests
/public/logos /public/flags
nuxt.config.ts · vercel.json · tailwind.config.ts
```

**File responsibility rules:**
- `/app/utils/*.ts` — pure functions, no I/O, unit tests required
- `/server/utils/*.ts` — I/O wrappers (KV, external API), mocked in tests
- `/server/api/*.ts` — thin orchestration: read, merge, return; no business logic
- Components stay under ~150 lines; split if larger

---

## Task 0: Project Bootstrap

**Files:**
- Create: `package.json`, `nuxt.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `app/assets/css/main.css`, `vitest.config.ts`, `.gitignore`, `.env.example`

- [ ] **Step 1: Init Nuxt 4 project**

The `docs/` directory already exists from spec/plan files. Use `--force` to bootstrap into a non-empty directory.

```bash
cd /Users/KR7Q10J5QY/Documents/IFLYTEK/AI-Projects/FIFAWorldCup2026
npx nuxi@latest init . --packageManager pnpm --gitInit false --force --no-install
pnpm install
```

Expected: `app/`, `nuxt.config.ts`, `package.json` created; `docs/` is preserved.

- [ ] **Step 2: Install runtime dependencies**

```bash
pnpm add @pinia/nuxt pinia @vercel/kv
pnpm add -D @nuxtjs/tailwindcss tailwindcss postcss autoprefixer typescript vue-tsc vitest @vue/test-utils happy-dom @types/node
```

- [ ] **Step 3: Configure `nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  typescript: { strict: true, typeCheck: true },
  nitro: {
    storage: { kv: { driver: 'vercelKV' } },
  },
  runtimeConfig: {
    footballDataApiKey: process.env.FOOTBALL_DATA_API_KEY,
  },
  app: {
    head: {
      title: '2026 World Cup Predictions',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }],
    },
  },
})
```

- [ ] **Step 4: Configure Tailwind**

Create `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'
export default {
  content: ['./app/**/*.{vue,ts}', './server/**/*.ts'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0f4c81', accent: '#e63946' },
      },
      screens: { xs: '375px' },
    },
  },
} satisfies Config
```

Create `app/assets/css/main.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html { -webkit-tap-highlight-color: transparent; }
body { @apply bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100; }
```

- [ ] **Step 5: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '~~': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
```

Add npm scripts to `package.json`:

```json
"scripts": {
  "dev": "nuxt dev",
  "build": "nuxt build",
  "generate": "nuxt generate",
  "preview": "nuxt preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "typecheck": "vue-tsc --noEmit"
}
```

- [ ] **Step 6: Create `.env.example` and `.gitignore`**

`.env.example`:
```
FOOTBALL_DATA_API_KEY=your_token_here
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

Append to `.gitignore`:
```
.env
.env.local
.vercel
.output
.nuxt
node_modules
coverage
```

- [ ] **Step 7: Verify build runs**

```bash
pnpm typecheck
pnpm build
```

Expected: both succeed with no errors.

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "chore: bootstrap Nuxt 4 project with Tailwind, Pinia, Vitest"
```

---

## Task 1: Shared TypeScript Types

**Files:**
- Create: `app/types/index.ts`
- Test: `tests/types.test.ts`

- [ ] **Step 1: Define all shared interfaces**

Create `app/types/index.ts`:

```ts
export interface Player {
  id: string
  name: string
  number: number
  position: 'GK' | 'DF' | 'MF' | 'FW'
  club: string
}

export interface RecentRecord {
  matches: number
  win: number
  draw: number
  lose: number
  goalsFor: number
  goalsAgainst: number
  avgGoals: number
  avgConceded: number
  avgPoints: number
}

export interface Team {
  id: string
  name: string
  nameEn: string
  logo: string
  flag: string
  group: string
  fifaRank: number
  fifaPoint: number
  style: string
  strength: string[]
  weakness: string[]
  recentRecord: RecentRecord
}

export type MatchStage = 'group' | 'r16' | 'qf' | 'sf' | 'final' | 'third'
export type MatchStatus = 'pending' | 'live' | 'ended'

export interface MatchResult {
  homeScore: number
  awayScore: number
  endedAt: string
}

export interface Match {
  id: string
  homeTeamId: string
  awayTeamId: string
  group?: string
  stage: MatchStage
  matchTime: string
  venue: string
  status: MatchStatus
  result?: MatchResult
}

export interface Prediction {
  homeWin: number
  draw: number
  awayWin: number
  bestScore: string
  confidence: number
}

export interface GroupStanding {
  teamId: string
  played: number
  win: number
  draw: number
  lose: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
}

export interface ChampionRate {
  teamId: string
  rate: number
  trend: 'up' | 'down' | 'flat'
}
```

- [ ] **Step 2: Write a smoke-test that imports the types**

Create `tests/types.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import type { Team, Match, Prediction } from '~/types'

describe('shared types', () => {
  it('Team interface accepts a valid object', () => {
    const t: Team = {
      id: 'BRA', name: '巴西', nameEn: 'Brazil',
      logo: '/logos/BRA.png', flag: '/flags/BRA.png',
      group: 'A', fifaRank: 1, fifaPoint: 1860,
      style: '技术流', strength: ['进攻'], weakness: ['防守'],
      recentRecord: { matches: 16, win: 11, draw: 3, lose: 2,
        goalsFor: 32, goalsAgainst: 9,
        avgGoals: 2.0, avgConceded: 0.56, avgPoints: 2.25 },
    }
    expect(t.id).toBe('BRA')
  })
})
```

- [ ] **Step 3: Run test**

```bash
pnpm test
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/types tests/types.test.ts
git commit -m "feat(types): add shared TypeScript interfaces"
```

---

## Task 2: Static Data Files (48 Teams)

**Files:**
- Create: `app/data/groups.json`, `app/data/recentRecords.json`, `app/data/teams.json`, `app/data/players.json`, `app/data/schedule.json`
- Test: `tests/data.test.ts`

> Use the user-provided dataset (groups A–L, 48 teams). Team `id` is uppercase 3-letter ISO code (BRA, ARG, FRA, etc.).

- [ ] **Step 1: Create `app/data/groups.json`**

```json
{
  "A": ["BRA","AUS","SCO","JAM"],
  "B": ["CAN","MAR","PAR","IRQ"],
  "C": ["GER","ECU","EGY","DEN"],
  "D": ["MEX","KOR","ALG","POL"],
  "E": ["ARG","JPN","NOR","TUR"],
  "F": ["FRA","SEN","PAN","ITA"],
  "G": ["POR","IRN","TUN","NZL"],
  "H": ["USA","SUI","CIV","HAI"],
  "I": ["ENG","URU","UZB","CUW"],
  "J": ["NED","COL","QAT","GHA"],
  "K": ["BEL","AUT","KSA","CPV"],
  "L": ["ESP","CRO","RSA","JOR"]
}
```

- [ ] **Step 2: Create `app/data/recentRecords.json`**

Use exact figures from the user's data (matches/W/D/L/GF/GA/avgGoals/avgConceded/avgPoints). Example structure (full file must contain all 48 teams):

```json
{
  "BRA": {"matches":16,"win":11,"draw":3,"lose":2,"goalsFor":32,"goalsAgainst":9,"avgGoals":2.00,"avgConceded":0.56,"avgPoints":2.25},
  "AUS": {"matches":14,"win":7,"draw":3,"lose":4,"goalsFor":22,"goalsAgainst":14,"avgGoals":1.57,"avgConceded":1.00,"avgPoints":1.71},
  "SCO": {"matches":13,"win":5,"draw":4,"lose":4,"goalsFor":18,"goalsAgainst":16,"avgGoals":1.38,"avgConceded":1.23,"avgPoints":1.46},
  "JAM": {"matches":11,"win":3,"draw":2,"lose":6,"goalsFor":10,"goalsAgainst":21,"avgGoals":0.91,"avgConceded":1.91,"avgPoints":1.00},
  "CAN": {"matches":13,"win":8,"draw":3,"lose":2,"goalsFor":21,"goalsAgainst":7,"avgGoals":1.62,"avgConceded":0.54,"avgPoints":2.08},
  "MAR": {"matches":14,"win":8,"draw":4,"lose":2,"goalsFor":21,"goalsAgainst":8,"avgGoals":1.50,"avgConceded":0.57,"avgPoints":2.00},
  "PAR": {"matches":13,"win":4,"draw":3,"lose":6,"goalsFor":13,"goalsAgainst":19,"avgGoals":1.00,"avgConceded":1.46,"avgPoints":1.15},
  "IRQ": {"matches":12,"win":4,"draw":3,"lose":5,"goalsFor":13,"goalsAgainst":18,"avgGoals":1.08,"avgConceded":1.50,"avgPoints":1.25},
  "GER": {"matches":15,"win":9,"draw":4,"lose":2,"goalsFor":30,"goalsAgainst":10,"avgGoals":2.00,"avgConceded":0.67,"avgPoints":2.20},
  "ECU": {"matches":13,"win":5,"draw":4,"lose":4,"goalsFor":17,"goalsAgainst":15,"avgGoals":1.31,"avgConceded":1.15,"avgPoints":1.46},
  "EGY": {"matches":13,"win":7,"draw":3,"lose":3,"goalsFor":21,"goalsAgainst":11,"avgGoals":1.62,"avgConceded":0.85,"avgPoints":1.85},
  "DEN": {"matches":14,"win":7,"draw":4,"lose":3,"goalsFor":23,"goalsAgainst":12,"avgGoals":1.64,"avgConceded":0.86,"avgPoints":1.79},
  "MEX": {"matches":14,"win":7,"draw":4,"lose":3,"goalsFor":22,"goalsAgainst":11,"avgGoals":1.57,"avgConceded":0.79,"avgPoints":1.79},
  "KOR": {"matches":15,"win":8,"draw":3,"lose":4,"goalsFor":24,"goalsAgainst":13,"avgGoals":1.60,"avgConceded":0.87,"avgPoints":1.80},
  "ALG": {"matches":14,"win":7,"draw":4,"lose":3,"goalsFor":22,"goalsAgainst":13,"avgGoals":1.57,"avgConceded":0.93,"avgPoints":1.79},
  "POL": {"matches":13,"win":6,"draw":3,"lose":4,"goalsFor":20,"goalsAgainst":15,"avgGoals":1.54,"avgConceded":1.15,"avgPoints":1.62},
  "ARG": {"matches":16,"win":12,"draw":3,"lose":1,"goalsFor":35,"goalsAgainst":7,"avgGoals":2.19,"avgConceded":0.44,"avgPoints":2.44},
  "JPN": {"matches":16,"win":11,"draw":2,"lose":3,"goalsFor":33,"goalsAgainst":11,"avgGoals":2.06,"avgConceded":0.69,"avgPoints":2.19},
  "NOR": {"matches":14,"win":11,"draw":2,"lose":1,"goalsFor":39,"goalsAgainst":7,"avgGoals":2.79,"avgConceded":0.50,"avgPoints":2.50},
  "TUR": {"matches":13,"win":6,"draw":4,"lose":3,"goalsFor":20,"goalsAgainst":12,"avgGoals":1.54,"avgConceded":0.92,"avgPoints":1.69},
  "FRA": {"matches":15,"win":11,"draw":3,"lose":1,"goalsFor":34,"goalsAgainst":8,"avgGoals":2.27,"avgConceded":0.53,"avgPoints":2.40},
  "SEN": {"matches":13,"win":7,"draw":3,"lose":3,"goalsFor":20,"goalsAgainst":12,"avgGoals":1.54,"avgConceded":0.92,"avgPoints":1.85},
  "PAN": {"matches":12,"win":3,"draw":3,"lose":6,"goalsFor":11,"goalsAgainst":20,"avgGoals":0.92,"avgConceded":1.67,"avgPoints":1.00},
  "ITA": {"matches":14,"win":8,"draw":3,"lose":3,"goalsFor":25,"goalsAgainst":12,"avgGoals":1.79,"avgConceded":0.86,"avgPoints":1.93},
  "POR": {"matches":15,"win":10,"draw":3,"lose":2,"goalsFor":31,"goalsAgainst":9,"avgGoals":2.07,"avgConceded":0.60,"avgPoints":2.20},
  "IRN": {"matches":15,"win":8,"draw":4,"lose":3,"goalsFor":25,"goalsAgainst":12,"avgGoals":1.67,"avgConceded":0.80,"avgPoints":1.87},
  "TUN": {"matches":12,"win":5,"draw":3,"lose":4,"goalsFor":15,"goalsAgainst":14,"avgGoals":1.25,"avgConceded":1.17,"avgPoints":1.50},
  "NZL": {"matches":11,"win":3,"draw":2,"lose":6,"goalsFor":9,"goalsAgainst":20,"avgGoals":0.82,"avgConceded":1.82,"avgPoints":1.00},
  "USA": {"matches":15,"win":9,"draw":3,"lose":3,"goalsFor":27,"goalsAgainst":12,"avgGoals":1.80,"avgConceded":0.80,"avgPoints":2.00},
  "SUI": {"matches":14,"win":7,"draw":5,"lose":2,"goalsFor":20,"goalsAgainst":9,"avgGoals":1.43,"avgConceded":0.64,"avgPoints":1.86},
  "CIV": {"matches":13,"win":6,"draw":4,"lose":3,"goalsFor":21,"goalsAgainst":14,"avgGoals":1.62,"avgConceded":1.08,"avgPoints":1.69},
  "HAI": {"matches":11,"win":2,"draw":2,"lose":7,"goalsFor":9,"goalsAgainst":23,"avgGoals":0.82,"avgConceded":2.09,"avgPoints":0.73},
  "ENG": {"matches":15,"win":10,"draw":4,"lose":1,"goalsFor":32,"goalsAgainst":7,"avgGoals":2.13,"avgConceded":0.47,"avgPoints":2.27},
  "URU": {"matches":14,"win":7,"draw":4,"lose":3,"goalsFor":23,"goalsAgainst":12,"avgGoals":1.64,"avgConceded":0.86,"avgPoints":1.79},
  "UZB": {"matches":13,"win":5,"draw":4,"lose":4,"goalsFor":16,"goalsAgainst":15,"avgGoals":1.23,"avgConceded":1.15,"avgPoints":1.46},
  "CUW": {"matches":12,"win":3,"draw":3,"lose":6,"goalsFor":12,"goalsAgainst":19,"avgGoals":1.00,"avgConceded":1.58,"avgPoints":1.00},
  "NED": {"matches":15,"win":10,"draw":3,"lose":2,"goalsFor":30,"goalsAgainst":10,"avgGoals":2.00,"avgConceded":0.67,"avgPoints":2.20},
  "COL": {"matches":15,"win":10,"draw":4,"lose":1,"goalsFor":29,"goalsAgainst":9,"avgGoals":1.93,"avgConceded":0.60,"avgPoints":2.27},
  "QAT": {"matches":13,"win":5,"draw":3,"lose":5,"goalsFor":17,"goalsAgainst":16,"avgGoals":1.31,"avgConceded":1.23,"avgPoints":1.38},
  "GHA": {"matches":13,"win":5,"draw":3,"lose":5,"goalsFor":17,"goalsAgainst":18,"avgGoals":1.31,"avgConceded":1.38,"avgPoints":1.38},
  "BEL": {"matches":14,"win":9,"draw":3,"lose":2,"goalsFor":28,"goalsAgainst":10,"avgGoals":2.00,"avgConceded":0.71,"avgPoints":2.14},
  "AUT": {"matches":13,"win":6,"draw":3,"lose":4,"goalsFor":20,"goalsAgainst":15,"avgGoals":1.54,"avgConceded":1.15,"avgPoints":1.62},
  "KSA": {"matches":13,"win":5,"draw":3,"lose":5,"goalsFor":18,"goalsAgainst":17,"avgGoals":1.38,"avgConceded":1.31,"avgPoints":1.38},
  "CPV": {"matches":12,"win":5,"draw":2,"lose":5,"goalsFor":14,"goalsAgainst":16,"avgGoals":1.17,"avgConceded":1.33,"avgPoints":1.42},
  "ESP": {"matches":15,"win":10,"draw":3,"lose":2,"goalsFor":31,"goalsAgainst":8,"avgGoals":2.07,"avgConceded":0.53,"avgPoints":2.20},
  "CRO": {"matches":14,"win":7,"draw":4,"lose":3,"goalsFor":21,"goalsAgainst":13,"avgGoals":1.50,"avgConceded":0.93,"avgPoints":1.79},
  "RSA": {"matches":12,"win":4,"draw":4,"lose":4,"goalsFor":20,"goalsAgainst":14,"avgGoals":1.67,"avgConceded":1.17,"avgPoints":1.33},
  "JOR": {"matches":12,"win":4,"draw":3,"lose":5,"goalsFor":12,"goalsAgainst":17,"avgGoals":1.00,"avgConceded":1.42,"avgPoints":1.25}
}
```

- [ ] **Step 3: Create `app/data/teams.json`**

48-team file. Each entry has full Team shape minus `recentRecord` (joined at runtime from `recentRecords.json`). Provide all 48 entries. Example for Brazil (rest must follow the same shape):

```json
{
  "BRA": {
    "id": "BRA", "name": "巴西", "nameEn": "Brazil",
    "logo": "/logos/BRA.png", "flag": "/flags/BRA.png",
    "group": "A", "fifaRank": 1, "fifaPoint": 1860,
    "style": "技术流·攻守平衡",
    "strength": ["前场创造力顶级", "中场控球", "丰富大赛经验"],
    "weakness": ["定位球防守一般", "客场作战不稳定"]
  }
}
```

For all 48 teams, use latest FIFA ranking (June 2026 update from fifa.com/en/rankings/men) for `fifaRank` / `fifaPoint`, and 2-3 short Chinese phrases each for `style` / `strength` / `weakness` based on the team's actual playing identity.

- [ ] **Step 4: Create `app/data/players.json`**

Each team key → array of 26 players (FIFA expanded squad rule for 2026). Use officially registered squad lists released after each federation's announcement. Schema:

```json
{
  "BRA": [
    {"id":"BRA-1","number":1,"name":"Alisson","position":"GK","club":"Liverpool"},
    {"id":"BRA-2","number":4,"name":"Marquinhos","position":"DF","club":"Paris SG"}
  ]
}
```

- [ ] **Step 5: Create `app/data/schedule.json`**

All 104 matches (72 group + 32 knockout). Use the official FIFA schedule (fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/match-center). Schema:

```json
[
  {
    "id": "M001",
    "homeTeamId": "MEX",
    "awayTeamId": "KOR",
    "group": "D",
    "stage": "group",
    "matchTime": "2026-06-11T20:00:00Z",
    "venue": "Estadio Azteca, Mexico City",
    "status": "pending"
  }
]
```

For knockout matches before draws are finalized, use placeholder team IDs `WA1` (winner of group A 1st place), `WA2`, `RUB` (runner-up B), `T16-1` (winner of round-of-16 match 1), etc. The `homeTeamId` resolution happens at runtime in `/server/api/knockout.ts` once group results are in.

- [ ] **Step 6: Write data validation test**

Create `tests/data.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import groups from '~~/app/data/groups.json'
import teams from '~~/app/data/teams.json'
import records from '~~/app/data/recentRecords.json'
import players from '~~/app/data/players.json'
import schedule from '~~/app/data/schedule.json'

describe('static data integrity', () => {
  it('groups has 12 keys A-L and 4 teams each', () => {
    const keys = Object.keys(groups)
    expect(keys).toHaveLength(12)
    for (const k of keys) {
      expect(groups[k as keyof typeof groups]).toHaveLength(4)
    }
  })

  it('teams.json has all 48 unique team IDs', () => {
    const ids = Object.keys(teams)
    expect(ids).toHaveLength(48)
    expect(new Set(ids).size).toBe(48)
  })

  it('every team in groups appears in teams.json', () => {
    const groupTeams = Object.values(groups).flat()
    for (const id of groupTeams) {
      expect(teams).toHaveProperty(id)
    }
  })

  it('every team has a recentRecord entry', () => {
    for (const id of Object.keys(teams)) {
      expect(records).toHaveProperty(id)
    }
  })

  it('every team has a players entry', () => {
    for (const id of Object.keys(teams)) {
      expect(players).toHaveProperty(id)
    }
  })

  it('schedule has 104 matches with valid stages', () => {
    expect(schedule).toHaveLength(104)
    const validStages = ['group','r16','qf','sf','final','third']
    for (const m of schedule) {
      expect(validStages).toContain(m.stage)
    }
  })

  it('group-stage matches reference valid teams in correct group', () => {
    for (const m of schedule.filter(x => x.stage === 'group')) {
      const g = groups[m.group as keyof typeof groups]
      expect(g).toContain(m.homeTeamId)
      expect(g).toContain(m.awayTeamId)
    }
  })
})
```

- [ ] **Step 7: Run tests**

```bash
pnpm test
```
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/data tests/data.test.ts
git commit -m "feat(data): add static data for 48 teams, 12 groups, 104 matches"
```

---

## Task 3: Standings Calculator (pure)

**Files:**
- Create: `app/utils/standingsCalc.ts`
- Test: `tests/standingsCalc.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/standingsCalc.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { calcGroupStandings } from '~/utils/standingsCalc'
import type { Match } from '~/types'

const m = (h: string, a: string, hs: number, as_: number, status: 'ended'|'pending'='ended'): Match => ({
  id: `${h}-${a}`, homeTeamId: h, awayTeamId: a,
  group: 'A', stage: 'group', matchTime: '2026-06-11T00:00:00Z',
  venue: 'X', status,
  result: status === 'ended' ? { homeScore: hs, awayScore: as_, endedAt: '2026-06-11T02:00:00Z' } : undefined,
})

describe('calcGroupStandings', () => {
  it('returns zeroed rows for all teams when no matches played', () => {
    const r = calcGroupStandings(['BRA','AUS','SCO','JAM'], [])
    expect(r).toHaveLength(4)
    expect(r.every(s => s.played === 0 && s.points === 0)).toBe(true)
  })

  it('counts a win for home team correctly', () => {
    const r = calcGroupStandings(['BRA','AUS'], [m('BRA','AUS',2,0)])
    const bra = r.find(x => x.teamId === 'BRA')!
    expect(bra.win).toBe(1); expect(bra.points).toBe(3)
    expect(bra.goalsFor).toBe(2); expect(bra.goalsAgainst).toBe(0)
    expect(bra.goalDiff).toBe(2)
  })

  it('handles a draw', () => {
    const r = calcGroupStandings(['BRA','AUS'], [m('BRA','AUS',1,1)])
    expect(r.find(x => x.teamId === 'BRA')!.points).toBe(1)
    expect(r.find(x => x.teamId === 'AUS')!.points).toBe(1)
  })

  it('ignores pending matches', () => {
    const r = calcGroupStandings(['BRA','AUS'], [m('BRA','AUS',2,0,'pending')])
    expect(r.every(s => s.played === 0)).toBe(true)
  })

  it('sorts by points then goalDiff then goalsFor', () => {
    const matches = [
      m('BRA','JAM',3,0), m('AUS','SCO',1,1),
      m('BRA','AUS',2,1), m('SCO','JAM',2,0),
    ]
    const r = calcGroupStandings(['BRA','AUS','SCO','JAM'], matches)
    expect(r[0].teamId).toBe('BRA')
    expect(r[3].teamId).toBe('JAM')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test tests/standingsCalc.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `standingsCalc.ts`**

Create `app/utils/standingsCalc.ts`:

```ts
import type { Match, GroupStanding } from '~/types'

export function calcGroupStandings(teamIds: string[], matches: Match[]): GroupStanding[] {
  const table: Record<string, GroupStanding> = {}
  for (const id of teamIds) {
    table[id] = {
      teamId: id, played: 0, win: 0, draw: 0, lose: 0,
      goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
    }
  }

  for (const match of matches) {
    if (match.status !== 'ended' || !match.result) continue
    const home = table[match.homeTeamId]
    const away = table[match.awayTeamId]
    if (!home || !away) continue

    const { homeScore, awayScore } = match.result
    home.played++; away.played++
    home.goalsFor += homeScore; home.goalsAgainst += awayScore
    away.goalsFor += awayScore; away.goalsAgainst += homeScore

    if (homeScore > awayScore) {
      home.win++; home.points += 3; away.lose++
    } else if (homeScore < awayScore) {
      away.win++; away.points += 3; home.lose++
    } else {
      home.draw++; away.draw++; home.points++; away.points++
    }
  }

  for (const row of Object.values(table)) {
    row.goalDiff = row.goalsFor - row.goalsAgainst
  }

  return Object.values(table).sort((a, b) =>
    b.points - a.points ||
    b.goalDiff - a.goalDiff ||
    b.goalsFor - a.goalsFor ||
    a.teamId.localeCompare(b.teamId)
  )
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test tests/standingsCalc.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/utils/standingsCalc.ts tests/standingsCalc.test.ts
git commit -m "feat(utils): add pure group standings calculator"
```

---

## Task 4: Match Prediction Algorithm (pure)

**Files:**
- Create: `app/utils/predictAlgorithm.ts`
- Test: `tests/predictAlgorithm.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/predictAlgorithm.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { predictMatch } from '~/utils/predictAlgorithm'
import type { Team, GroupStanding } from '~/types'

const team = (id: string, rank: number, recent: Partial<Team['recentRecord']>): Team => ({
  id, name: id, nameEn: id, logo: '', flag: '', group: 'A',
  fifaRank: rank, fifaPoint: 2000 - rank * 5,
  style: '', strength: [], weakness: [],
  recentRecord: {
    matches: 14, win: 7, draw: 4, lose: 3,
    goalsFor: 20, goalsAgainst: 12,
    avgGoals: 1.5, avgConceded: 0.85, avgPoints: 1.79,
    ...recent,
  },
})

describe('predictMatch', () => {
  it('returns probabilities that sum to ~100%', () => {
    const home = team('BRA', 1, { win: 11, draw: 3, lose: 2, goalsFor: 32, goalsAgainst: 9 })
    const away = team('JAM', 60, { win: 3, draw: 2, lose: 6, goalsFor: 10, goalsAgainst: 21 })
    const p = predictMatch(home, away, [], [])
    expect(p.homeWin + p.draw + p.awayWin).toBeCloseTo(100, 0)
  })

  it('favors stronger team', () => {
    const home = team('BRA', 1, { win: 11, draw: 3, lose: 2, goalsFor: 32, goalsAgainst: 9 })
    const away = team('JAM', 60, { win: 3, draw: 2, lose: 6, goalsFor: 10, goalsAgainst: 21 })
    const p = predictMatch(home, away, [], [])
    expect(p.homeWin).toBeGreaterThan(p.awayWin)
    expect(p.homeWin).toBeGreaterThan(50)
  })

  it('returns roughly even odds for similar teams', () => {
    const home = team('GER', 10, {})
    const away = team('NED', 11, {})
    const p = predictMatch(home, away, [], [])
    expect(Math.abs(p.homeWin - p.awayWin)).toBeLessThan(15)
  })

  it('produces a valid scoreline string and confidence in [0,1]', () => {
    const home = team('BRA', 1, {})
    const away = team('JAM', 60, {})
    const p = predictMatch(home, away, [], [])
    expect(p.bestScore).toMatch(/^\d+-\d+$/)
    expect(p.confidence).toBeGreaterThanOrEqual(0)
    expect(p.confidence).toBeLessThanOrEqual(1)
  })

  it('considers current group standings (factor 4)', () => {
    const home = team('BRA', 5, {})
    const away = team('FRA', 4, {})
    const empty: GroupStanding[] = []
    const homeLeading: GroupStanding[] = [
      { teamId: 'BRA', played: 2, win: 2, draw: 0, lose: 0, goalsFor: 5, goalsAgainst: 0, goalDiff: 5, points: 6 },
      { teamId: 'FRA', played: 2, win: 0, draw: 0, lose: 2, goalsFor: 0, goalsAgainst: 5, goalDiff: -5, points: 0 },
    ]
    const a = predictMatch(home, away, empty, [])
    const b = predictMatch(home, away, homeLeading, [])
    expect(b.homeWin).toBeGreaterThan(a.homeWin)
  })
})
```

- [ ] **Step 2: Run tests to verify failure**

```bash
pnpm test tests/predictAlgorithm.test.ts
```
Expected: FAIL — `predictMatch` undefined.

- [ ] **Step 3: Implement `predictAlgorithm.ts`**

Create `app/utils/predictAlgorithm.ts`:

```ts
import type { Team, GroupStanding, Player, Prediction } from '~/types'

const W = { rank: 0.25, form: 0.25, attack: 0.20, group: 0.15, squad: 0.15 } as const

function rankScore(rank: number): number {
  return Math.max(0, 100 - Math.log2(rank) * 14)
}

function formScore(t: Team): number {
  return (t.recentRecord.avgPoints / 3) * 100
}

function attackScore(t: Team): number {
  const r = t.recentRecord
  const denom = Math.max(0.3, r.avgConceded)
  const ratio = r.avgGoals / denom
  return Math.min(100, ratio * 30)
}

function groupScore(teamId: string, standings: GroupStanding[]): number {
  if (standings.length === 0) return 50
  const row = standings.find(s => s.teamId === teamId)
  if (!row || row.played === 0) return 50
  return (row.points / (row.played * 3)) * 100
}

function squadScore(squad: Player[]): number {
  if (squad.length === 0) return 80
  return Math.min(100, (squad.length / 26) * 100)
}

function teamPower(t: Team, standings: GroupStanding[], squad: Player[]): number {
  return rankScore(t.fifaRank) * W.rank
    + formScore(t) * W.form
    + attackScore(t) * W.attack
    + groupScore(t.id, standings) * W.group
    + squadScore(squad) * W.squad
}

function bestScoreline(homeAvgGoals: number, awayAvgGoals: number, homeWin: number, awayWin: number): string {
  let h = Math.round(homeAvgGoals)
  let a = Math.round(awayAvgGoals)
  if (homeWin > awayWin && h <= a) h = a + 1
  if (awayWin > homeWin && a <= h) a = h + 1
  if (Math.abs(homeWin - awayWin) < 8 && h !== a) {
    if (h > a) a = h - 1
    else h = a - 1
  }
  return `${Math.max(0, h)}-${Math.max(0, a)}`
}

export function predictMatch(
  home: Team,
  away: Team,
  groupStandings: GroupStanding[],
  awaySquad: Player[] = [],
  homeSquad: Player[] = []
): Prediction {
  const homePower = teamPower(home, groupStandings, homeSquad)
  const awayPower = teamPower(away, groupStandings, awaySquad)
  const diff = homePower - awayPower

  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x / 12))
  const homeAdvantage = 3
  const homeRaw = sigmoid(diff + homeAdvantage)
  const awayRaw = sigmoid(-diff)

  const totalRaw = homeRaw + awayRaw
  const competitiveness = 1 - Math.abs(homeRaw - awayRaw) / totalRaw
  const drawShare = 0.18 + competitiveness * 0.12

  const homeWin = (1 - drawShare) * (homeRaw / totalRaw) * 100
  const awayWin = (1 - drawShare) * (awayRaw / totalRaw) * 100
  const draw = drawShare * 100

  const confidence = Math.min(1, Math.abs(homePower - awayPower) / 30)

  return {
    homeWin: Math.round(homeWin * 10) / 10,
    draw: Math.round(draw * 10) / 10,
    awayWin: Math.round(awayWin * 10) / 10,
    bestScore: bestScoreline(home.recentRecord.avgGoals, away.recentRecord.avgGoals, homeWin, awayWin),
    confidence: Math.round(confidence * 100) / 100,
  }
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test tests/predictAlgorithm.test.ts
```
Expected: PASS (all 5 cases).

- [ ] **Step 5: Commit**

```bash
git add app/utils/predictAlgorithm.ts tests/predictAlgorithm.test.ts
git commit -m "feat(utils): add weighted match prediction algorithm"
```

---

## Task 5: Championship Probability Calculator (pure)

**Files:**
- Create: `app/utils/probabilityCalc.ts`
- Test: `tests/probabilityCalc.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/probabilityCalc.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { calcChampionRates } from '~/utils/probabilityCalc'
import type { Team } from '~/types'

const team = (id: string, rank: number, avgPts: number): Team => ({
  id, name: id, nameEn: id, logo: '', flag: '', group: 'A',
  fifaRank: rank, fifaPoint: 2000 - rank * 5,
  style: '', strength: [], weakness: [],
  recentRecord: {
    matches: 14, win: 8, draw: 3, lose: 3,
    goalsFor: 25, goalsAgainst: 10,
    avgGoals: 1.78, avgConceded: 0.71, avgPoints: avgPts,
  },
})

describe('calcChampionRates', () => {
  it('returns rates that sum to ~100% for active teams', () => {
    const teams = [team('BRA',1,2.25), team('ARG',2,2.44), team('FRA',3,2.40), team('ENG',4,2.27)]
    const rates = calcChampionRates(teams, new Set(teams.map(t => t.id)))
    const total = Object.values(rates).reduce((s,v)=>s+v,0)
    expect(total).toBeCloseTo(100, 0)
  })

  it('eliminated teams get 0%', () => {
    const teams = [team('BRA',1,2.25), team('ARG',2,2.44), team('JAM',60,1.0)]
    const rates = calcChampionRates(teams, new Set(['BRA','ARG']))
    expect(rates['JAM']).toBe(0)
    expect(rates['BRA'] + rates['ARG']).toBeCloseTo(100, 0)
  })

  it('higher-ranked, better-form team gets higher rate', () => {
    const strong = team('ARG', 2, 2.44)
    const weak = team('JAM', 60, 1.00)
    const rates = calcChampionRates([strong, weak], new Set(['ARG','JAM']))
    expect(rates['ARG']).toBeGreaterThan(rates['JAM'])
  })

  it('handles last team alive at 100%', () => {
    const teams = [team('BRA',1,2.25), team('JAM',60,1.0)]
    const rates = calcChampionRates(teams, new Set(['BRA']))
    expect(rates['BRA']).toBeCloseTo(100, 0)
    expect(rates['JAM']).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify failure**

```bash
pnpm test tests/probabilityCalc.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `probabilityCalc.ts`**

Create `app/utils/probabilityCalc.ts`:

```ts
import type { Team } from '~/types'

const W = { attackDef: 0.30, form: 0.25, rank: 0.20, schedule: 0.15, exp: 0.10 } as const

const EXPERIENCE_BONUS: Record<string, number> = {
  BRA: 100, ARG: 100, GER: 95, ITA: 95, FRA: 90, ESP: 85, ENG: 85,
  NED: 80, POR: 80, URU: 80, BEL: 70, CRO: 70, MEX: 65, USA: 60,
  COL: 60, JPN: 55, KOR: 55, MAR: 55, SUI: 60, DEN: 55, POL: 55,
  NOR: 40, SEN: 50, AUS: 50, IRN: 45, EGY: 45, TUN: 45, GHA: 50,
  CIV: 50, ALG: 45, RSA: 40, ECU: 50, PAR: 50, QAT: 35, KSA: 40,
  CPV: 20, IRQ: 30, UZB: 20, JOR: 20, NZL: 35, JAM: 30, PAN: 35,
  HAI: 30, CUW: 15, TUR: 50, AUT: 50, ITA_DUMMY: 0,
}

function attackDefIndex(t: Team): number {
  const r = t.recentRecord
  const ratio = r.avgGoals / Math.max(0.3, r.avgConceded)
  return Math.min(100, ratio * 30)
}

function formIndex(t: Team): number {
  return (t.recentRecord.avgPoints / 3) * 100
}

function rankIndex(t: Team): number {
  return Math.max(0, 100 - Math.log2(t.fifaRank) * 14)
}

function scheduleDifficulty(_t: Team): number {
  return 50
}

function experienceIndex(t: Team): number {
  return EXPERIENCE_BONUS[t.id] ?? 30
}

export function calcChampionRates(teams: Team[], aliveIds: Set<string>): Record<string, number> {
  const raw: Record<string, number> = {}
  for (const t of teams) {
    if (!aliveIds.has(t.id)) {
      raw[t.id] = 0
      continue
    }
    raw[t.id] =
      attackDefIndex(t) * W.attackDef
      + formIndex(t) * W.form
      + rankIndex(t) * W.rank
      + (100 - scheduleDifficulty(t)) * W.schedule
      + experienceIndex(t) * W.exp
  }
  const total = Object.values(raw).reduce((s, v) => s + v, 0)
  const out: Record<string, number> = {}
  for (const id of Object.keys(raw)) {
    out[id] = total === 0 ? 0 : Math.round((raw[id] / total) * 100 * 10) / 10
  }
  return out
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test tests/probabilityCalc.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/utils/probabilityCalc.ts tests/probabilityCalc.test.ts
git commit -m "feat(utils): add championship probability calculator"
```

---

## Task 6: Football-Data.org API Client

**Files:**
- Create: `server/utils/footballDataClient.ts`
- Test: `tests/footballDataClient.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/footballDataClient.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchWorldCupMatches } from '~~/server/utils/footballDataClient'

beforeEach(() => { vi.restoreAllMocks() })

describe('fetchWorldCupMatches', () => {
  it('calls Football-Data.org with X-Auth-Token header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ matches: [] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await fetchWorldCupMatches('test-token')
    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toContain('competitions/WC/matches')
    expect((options as RequestInit).headers).toMatchObject({ 'X-Auth-Token': 'test-token' })
  })

  it('returns parsed match list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        matches: [
          { id: 1, homeTeam: { tla: 'BRA' }, awayTeam: { tla: 'JAM' },
            status: 'FINISHED', score: { fullTime: { home: 3, away: 0 } },
            utcDate: '2026-06-15T20:00:00Z' },
        ],
      }),
    }))

    const matches = await fetchWorldCupMatches('token')
    expect(matches).toHaveLength(1)
    expect(matches[0]).toMatchObject({
      homeTla: 'BRA', awayTla: 'JAM', status: 'FINISHED',
      homeScore: 3, awayScore: 0,
    })
  })

  it('throws on 429 rate limit', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }))
    await expect(fetchWorldCupMatches('token')).rejects.toThrow(/rate limit|429/i)
  })

  it('throws on other HTTP errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    await expect(fetchWorldCupMatches('token')).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run tests, verify failure**

```bash
pnpm test tests/footballDataClient.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement client**

Create `server/utils/footballDataClient.ts`:

```ts
export interface ExternalMatch {
  externalId: number
  homeTla: string
  awayTla: string
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED'
  homeScore: number | null
  awayScore: number | null
  utcDate: string
}

const BASE_URL = 'https://api.football-data.org/v4'

export async function fetchWorldCupMatches(token: string): Promise<ExternalMatch[]> {
  const res = await fetch(`${BASE_URL}/competitions/WC/matches`, {
    headers: { 'X-Auth-Token': token },
  })
  if (!res.ok) {
    if (res.status === 429) throw new Error('Football-Data.org rate limit (429)')
    throw new Error(`Football-Data.org error: ${res.status}`)
  }
  const data = await res.json() as { matches: any[] }
  return data.matches.map(m => ({
    externalId: m.id,
    homeTla: m.homeTeam?.tla ?? '',
    awayTla: m.awayTeam?.tla ?? '',
    status: m.status,
    homeScore: m.score?.fullTime?.home ?? null,
    awayScore: m.score?.fullTime?.away ?? null,
    utcDate: m.utcDate,
  }))
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test tests/footballDataClient.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/utils/footballDataClient.ts tests/footballDataClient.test.ts
git commit -m "feat(server): add Football-Data.org API client"
```

---

## Task 7: KV Cache Wrapper

**Files:**
- Create: `server/utils/kvClient.ts`
- Test: `tests/kvClient.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/kvClient.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const store = new Map<string, any>()
vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(async (k: string) => store.get(k) ?? null),
    set: vi.fn(async (k: string, v: any) => { store.set(k, v) }),
    del: vi.fn(async (k: string) => { store.delete(k) }),
  },
}))

beforeEach(() => { store.clear() })

import { setMatchResult, getMatchResult, setChampionRates, getChampionRates } from '~~/server/utils/kvClient'

describe('kvClient', () => {
  it('round-trips a match result', async () => {
    await setMatchResult('M001', { status: 'ended', homeScore: 2, awayScore: 1, endedAt: '2026-06-11T22:00Z' })
    const r = await getMatchResult('M001')
    expect(r).toEqual({ status: 'ended', homeScore: 2, awayScore: 1, endedAt: '2026-06-11T22:00Z' })
  })

  it('returns null for missing match', async () => {
    expect(await getMatchResult('NOPE')).toBeNull()
  })

  it('round-trips champion rates', async () => {
    await setChampionRates({ BRA: 18.5, ARG: 17.2 })
    const r = await getChampionRates()
    expect(r).toEqual({ BRA: 18.5, ARG: 17.2 })
  })

  it('returns empty object when no champion rates set', async () => {
    expect(await getChampionRates()).toEqual({})
  })
})
```

- [ ] **Step 2: Run tests, verify failure**

```bash
pnpm test tests/kvClient.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implement client**

Create `server/utils/kvClient.ts`:

```ts
import { kv } from '@vercel/kv'

export interface CachedMatchResult {
  status: 'pending' | 'live' | 'ended'
  homeScore: number | null
  awayScore: number | null
  endedAt?: string
}

export async function setMatchResult(matchId: string, r: CachedMatchResult): Promise<void> {
  await kv.set(`match:${matchId}`, r)
}

export async function getMatchResult(matchId: string): Promise<CachedMatchResult | null> {
  return (await kv.get<CachedMatchResult>(`match:${matchId}`)) ?? null
}

export async function getAllMatchResults(matchIds: string[]): Promise<Record<string, CachedMatchResult>> {
  const out: Record<string, CachedMatchResult> = {}
  for (const id of matchIds) {
    const v = await getMatchResult(id)
    if (v) out[id] = v
  }
  return out
}

export async function setChampionRates(rates: Record<string, number>): Promise<void> {
  await kv.set('champion_rates', rates)
}

export async function getChampionRates(): Promise<Record<string, number>> {
  return (await kv.get<Record<string, number>>('champion_rates')) ?? {}
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test tests/kvClient.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/utils/kvClient.ts tests/kvClient.test.ts
git commit -m "feat(server): add Vercel KV cache wrapper"
```

---

## Task 8: Server API — `/api/teams`

**Files:**
- Create: `server/api/teams.get.ts`
- Test: `tests/api-teams.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/api-teams.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('~~/server/utils/kvClient', () => ({
  getChampionRates: vi.fn(async () => ({ BRA: 18.5, ARG: 17.2 })),
}))

const handler = (await import('~~/server/api/teams.get')).default

describe('GET /api/teams', () => {
  it('returns 48 teams merged with champion rates', async () => {
    const event = {} as any
    const result = await handler(event)
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(48)
    const bra = result.find((t: any) => t.id === 'BRA')!
    expect(bra.championRate).toBe(18.5)
    expect(bra.recentRecord).toBeDefined()
    const jam = result.find((t: any) => t.id === 'JAM')!
    expect(jam.championRate).toBe(0)
  })
})
```

- [ ] **Step 2: Implement `/api/teams` route**

Create `server/api/teams.get.ts`:

```ts
import { defineEventHandler } from 'h3'
import teams from '~~/app/data/teams.json'
import records from '~~/app/data/recentRecords.json'
import { getChampionRates } from '~~/server/utils/kvClient'

export default defineEventHandler(async () => {
  const rates = await getChampionRates()
  return Object.values(teams).map((t: any) => ({
    ...t,
    recentRecord: (records as Record<string, any>)[t.id],
    championRate: rates[t.id] ?? 0,
  }))
})
```

- [ ] **Step 3: Run test**

```bash
pnpm test tests/api-teams.test.ts
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add server/api/teams.get.ts tests/api-teams.test.ts
git commit -m "feat(api): GET /api/teams returns merged team data"
```

---

## Task 9: Server API — `/api/matches` and `/api/matches/[id]`

**Files:**
- Create: `server/api/matches.get.ts`, `server/api/matches/[id].get.ts`
- Test: `tests/api-matches.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/api-matches.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('~~/server/utils/kvClient', () => ({
  getMatchResult: vi.fn(async (id: string) =>
    id === 'M001'
      ? { status: 'ended', homeScore: 2, awayScore: 0, endedAt: '2026-06-11T22:00Z' }
      : null
  ),
  getChampionRates: vi.fn(async () => ({})),
}))

const list = (await import('~~/server/api/matches.get')).default
const single = (await import('~~/server/api/matches/[id].get')).default

describe('matches API', () => {
  it('GET /api/matches returns 104 matches with KV overlay', async () => {
    const result = await list({} as any)
    expect(result).toHaveLength(104)
    const m1 = result.find((m: any) => m.id === 'M001')!
    expect(m1.status).toBe('ended')
    expect(m1.result).toMatchObject({ homeScore: 2, awayScore: 0 })
  })

  it('GET /api/matches/M001 returns single match with prediction', async () => {
    const event = { context: { params: { id: 'M001' } } } as any
    const m = await single(event)
    expect(m.id).toBe('M001')
    expect(m.prediction).toBeDefined()
    expect(m.prediction.homeWin + m.prediction.draw + m.prediction.awayWin).toBeCloseTo(100, 0)
  })

  it('GET /api/matches/UNKNOWN throws 404', async () => {
    const event = { context: { params: { id: 'NOPE' } } } as any
    await expect(single(event)).rejects.toMatchObject({ statusCode: 404 })
  })
})
```

- [ ] **Step 2: Implement list route**

Create `server/api/matches.get.ts`:

```ts
import { defineEventHandler } from 'h3'
import schedule from '~~/app/data/schedule.json'
import { getMatchResult } from '~~/server/utils/kvClient'

export default defineEventHandler(async () => {
  const out = []
  for (const m of schedule as any[]) {
    const cached = await getMatchResult(m.id)
    if (cached) {
      out.push({
        ...m,
        status: cached.status,
        result: cached.status === 'ended'
          ? { homeScore: cached.homeScore, awayScore: cached.awayScore, endedAt: cached.endedAt }
          : undefined,
      })
    } else {
      out.push(m)
    }
  }
  return out
})
```

- [ ] **Step 3: Implement single-match route**

Create `server/api/matches/[id].get.ts`:

```ts
import { defineEventHandler, createError, getRouterParam } from 'h3'
import schedule from '~~/app/data/schedule.json'
import teams from '~~/app/data/teams.json'
import records from '~~/app/data/recentRecords.json'
import players from '~~/app/data/players.json'
import { getMatchResult } from '~~/server/utils/kvClient'
import { calcGroupStandings } from '~/utils/standingsCalc'
import { predictMatch } from '~/utils/predictAlgorithm'
import groups from '~~/app/data/groups.json'
import type { Match } from '~/types'

function buildTeam(id: string) {
  const t = (teams as any)[id]
  if (!t) return null
  return { ...t, recentRecord: (records as any)[id] }
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const base = (schedule as any[]).find(m => m.id === id)
  if (!base) throw createError({ statusCode: 404, statusMessage: 'Match not found' })

  const cached = await getMatchResult(base.id)
  const enriched: Match = cached
    ? { ...base, status: cached.status, result: cached.status === 'ended'
        ? { homeScore: cached.homeScore, awayScore: cached.awayScore, endedAt: cached.endedAt! } : undefined }
    : base

  const home = buildTeam(base.homeTeamId)
  const away = buildTeam(base.awayTeamId)
  if (!home || !away) {
    return { ...enriched, prediction: null }
  }

  let standings: ReturnType<typeof calcGroupStandings> = []
  if (base.group) {
    const groupTeams = (groups as any)[base.group] as string[]
    const groupMatches: Match[] = []
    for (const m of (schedule as any[]).filter(m => m.group === base.group)) {
      const c = await getMatchResult(m.id)
      groupMatches.push(c
        ? { ...m, status: c.status, result: c.status === 'ended'
            ? { homeScore: c.homeScore, awayScore: c.awayScore, endedAt: c.endedAt! } : undefined }
        : m)
    }
    standings = calcGroupStandings(groupTeams, groupMatches)
  }

  const prediction = predictMatch(
    home,
    away,
    standings,
    (players as any)[away.id] ?? [],
    (players as any)[home.id] ?? [],
  )

  return { ...enriched, prediction }
})
```

- [ ] **Step 4: Run tests**

```bash
pnpm test tests/api-matches.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/api/matches.get.ts server/api/matches tests/api-matches.test.ts
git commit -m "feat(api): GET /api/matches list and single-match prediction"
```

---

## Task 10: Server API — `/api/groups/[group]`

**Files:**
- Create: `server/api/groups/[group].get.ts`
- Test: `tests/api-groups.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/api-groups.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('~~/server/utils/kvClient', () => ({
  getMatchResult: vi.fn(async () => null),
  getChampionRates: vi.fn(async () => ({})),
}))

const handler = (await import('~~/server/api/groups/[group].get')).default

describe('GET /api/groups/[group]', () => {
  it('returns standings, fixtures, and team list for group A', async () => {
    const event = { context: { params: { group: 'A' } } } as any
    const result = await handler(event)
    expect(result.group).toBe('A')
    expect(result.teams).toHaveLength(4)
    expect(result.standings).toHaveLength(4)
    expect(result.fixtures.length).toBeGreaterThan(0)
    expect(result.fixtures.every((m: any) => m.group === 'A')).toBe(true)
  })

  it('throws 404 for invalid group', async () => {
    const event = { context: { params: { group: 'Z' } } } as any
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 404 })
  })
})
```

- [ ] **Step 2: Implement route**

Create `server/api/groups/[group].get.ts`:

```ts
import { defineEventHandler, createError, getRouterParam } from 'h3'
import schedule from '~~/app/data/schedule.json'
import teams from '~~/app/data/teams.json'
import records from '~~/app/data/recentRecords.json'
import groups from '~~/app/data/groups.json'
import { getMatchResult } from '~~/server/utils/kvClient'
import { calcGroupStandings } from '~/utils/standingsCalc'
import type { Match } from '~/types'

export default defineEventHandler(async (event) => {
  const group = (getRouterParam(event, 'group') ?? '').toUpperCase()
  const teamIds = (groups as any)[group] as string[] | undefined
  if (!teamIds) throw createError({ statusCode: 404, statusMessage: 'Group not found' })

  const fixtures: Match[] = []
  for (const m of (schedule as any[]).filter(m => m.group === group)) {
    const c = await getMatchResult(m.id)
    fixtures.push(c
      ? { ...m, status: c.status, result: c.status === 'ended'
          ? { homeScore: c.homeScore, awayScore: c.awayScore, endedAt: c.endedAt! } : undefined }
      : m)
  }

  const standings = calcGroupStandings(teamIds, fixtures)
  const teamList = teamIds.map(id => ({
    ...(teams as any)[id],
    recentRecord: (records as any)[id],
  }))

  return { group, teams: teamList, standings, fixtures }
})
```

- [ ] **Step 3: Run test**

```bash
pnpm test tests/api-groups.test.ts
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add server/api/groups tests/api-groups.test.ts
git commit -m "feat(api): GET /api/groups/[group] returns standings + fixtures"
```

---

## Task 11: Server API — `/api/knockout`

**Files:**
- Create: `server/api/knockout.get.ts`
- Test: `tests/api-knockout.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/api-knockout.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('~~/server/utils/kvClient', () => ({
  getMatchResult: vi.fn(async () => null),
  getChampionRates: vi.fn(async () => ({ BRA: 18.5, ARG: 17.2 })),
}))

const handler = (await import('~~/server/api/knockout.get')).default

describe('GET /api/knockout', () => {
  it('returns bracket grouped by stage and champion rates', async () => {
    const result = await handler({} as any)
    expect(result.bracket).toBeDefined()
    expect(result.bracket.r16).toHaveLength(16)
    expect(result.bracket.qf).toHaveLength(8)
    expect(result.bracket.sf).toHaveLength(4)
    expect(result.bracket.final).toHaveLength(1)
    expect(result.championRates['BRA']).toBe(18.5)
  })
})
```

- [ ] **Step 2: Implement route**

Create `server/api/knockout.get.ts`:

```ts
import { defineEventHandler } from 'h3'
import schedule from '~~/app/data/schedule.json'
import { getMatchResult, getChampionRates } from '~~/server/utils/kvClient'
import type { Match, MatchStage } from '~/types'

const STAGES: MatchStage[] = ['r16', 'qf', 'sf', 'final', 'third']

export default defineEventHandler(async () => {
  const bracket: Record<MatchStage, Match[]> = {
    group: [], r16: [], qf: [], sf: [], final: [], third: [],
  }
  for (const m of (schedule as any[])) {
    if (!STAGES.includes(m.stage)) continue
    const c = await getMatchResult(m.id)
    const enriched: Match = c
      ? { ...m, status: c.status, result: c.status === 'ended'
          ? { homeScore: c.homeScore, awayScore: c.awayScore, endedAt: c.endedAt! } : undefined }
      : m
    bracket[m.stage as MatchStage].push(enriched)
  }
  const championRates = await getChampionRates()
  return { bracket, championRates }
})
```

- [ ] **Step 3: Run test**

```bash
pnpm test tests/api-knockout.test.ts
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add server/api/knockout.get.ts tests/api-knockout.test.ts
git commit -m "feat(api): GET /api/knockout returns bracket + champion rates"
```

---

## Task 12: Server API — `/api/sync` (Cron handler)

**Files:**
- Create: `server/api/sync.post.ts`, `server/utils/syncEngine.ts`
- Test: `tests/syncEngine.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/syncEngine.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const kvStore = new Map<string, any>()
vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(async (k: string) => kvStore.get(k) ?? null),
    set: vi.fn(async (k: string, v: any) => { kvStore.set(k, v) }),
    del: vi.fn(async (k: string) => { kvStore.delete(k) }),
  },
}))
vi.mock('~~/server/utils/footballDataClient', () => ({
  fetchWorldCupMatches: vi.fn(),
}))

beforeEach(() => kvStore.clear())

const { runSync } = await import('~~/server/utils/syncEngine')
const { fetchWorldCupMatches } = await import('~~/server/utils/footballDataClient')

describe('runSync', () => {
  it('writes finished matches to KV with mapped TLAs', async () => {
    vi.mocked(fetchWorldCupMatches).mockResolvedValue([
      { externalId: 1, homeTla: 'BRA', awayTla: 'JAM', status: 'FINISHED',
        homeScore: 3, awayScore: 0, utcDate: '2026-06-15T20:00:00Z' },
    ])
    const result = await runSync('test-token')
    expect(result.updated).toBe(1)
    expect(kvStore.size).toBeGreaterThan(0)
  })

  it('skips matches not yet finished', async () => {
    vi.mocked(fetchWorldCupMatches).mockResolvedValue([
      { externalId: 1, homeTla: 'BRA', awayTla: 'JAM', status: 'SCHEDULED',
        homeScore: null, awayScore: null, utcDate: '2026-06-15T20:00:00Z' },
    ])
    const result = await runSync('test-token')
    expect(result.updated).toBe(0)
  })

  it('updates champion_rates after sync', async () => {
    vi.mocked(fetchWorldCupMatches).mockResolvedValue([])
    await runSync('test-token')
    expect(kvStore.has('champion_rates')).toBe(true)
  })

  it('returns error result on API failure', async () => {
    vi.mocked(fetchWorldCupMatches).mockRejectedValue(new Error('429'))
    const result = await runSync('test-token')
    expect(result.error).toMatch(/429/)
    expect(result.updated).toBe(0)
  })
})
```

- [ ] **Step 2: Implement sync engine**

Create `server/utils/syncEngine.ts`:

```ts
import schedule from '~~/app/data/schedule.json'
import teamsJson from '~~/app/data/teams.json'
import recordsJson from '~~/app/data/recentRecords.json'
import { fetchWorldCupMatches } from './footballDataClient'
import { setMatchResult, setChampionRates, getMatchResult } from './kvClient'
import { calcChampionRates } from '~/utils/probabilityCalc'
import type { Team } from '~/types'

interface SyncResult { updated: number; error?: string }

function externalIdMatches(localMatch: any, ext: any): boolean {
  if (localMatch.homeTeamId !== ext.homeTla) return false
  if (localMatch.awayTeamId !== ext.awayTla) return false
  const localTime = new Date(localMatch.matchTime).getTime()
  const extTime = new Date(ext.utcDate).getTime()
  return Math.abs(localTime - extTime) < 6 * 60 * 60 * 1000
}

async function computeAliveTeams(): Promise<Set<string>> {
  const alive = new Set<string>(Object.keys(teamsJson))
  // After group stage, eliminated teams come out; for now (pre-tournament) all alive.
  // Real elimination logic added when knockout draw is done.
  return alive
}

export async function runSync(token: string): Promise<SyncResult> {
  let updated = 0
  try {
    const external = await fetchWorldCupMatches(token)
    for (const ext of external) {
      if (ext.status !== 'FINISHED' || ext.homeScore === null || ext.awayScore === null) continue
      const local = (schedule as any[]).find(m => externalIdMatches(m, ext))
      if (!local) continue
      const existing = await getMatchResult(local.id)
      if (existing?.status === 'ended' &&
          existing.homeScore === ext.homeScore &&
          existing.awayScore === ext.awayScore) continue
      await setMatchResult(local.id, {
        status: 'ended',
        homeScore: ext.homeScore,
        awayScore: ext.awayScore,
        endedAt: ext.utcDate,
      })
      updated++
    }
    const teamArray: Team[] = Object.values(teamsJson).map((t: any) => ({
      ...t, recentRecord: (recordsJson as any)[t.id],
    }))
    const alive = await computeAliveTeams()
    const rates = calcChampionRates(teamArray, alive)
    await setChampionRates(rates)
    return { updated }
  } catch (e: any) {
    return { updated, error: e.message ?? String(e) }
  }
}
```

- [ ] **Step 3: Implement cron route**

Create `server/api/sync.post.ts`:

```ts
import { defineEventHandler, getHeader, createError, useRuntimeConfig } from 'h3'
import { runSync } from '~~/server/utils/syncEngine'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cronAuth = getHeader(event, 'authorization')
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Allow if secret matches OR if running locally.
  if (process.env.CRON_SECRET && cronAuth !== `Bearer ${process.env.CRON_SECRET}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const token = config.footballDataApiKey
  if (!token) throw createError({ statusCode: 500, statusMessage: 'API key not configured' })
  return await runSync(token)
})
```

- [ ] **Step 4: Run tests**

```bash
pnpm test tests/syncEngine.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/utils/syncEngine.ts server/api/sync.post.ts tests/syncEngine.test.ts
git commit -m "feat(api): POST /api/sync cron handler with Football-Data sync"
```

---

## Task 13: Pinia Stores

**Files:**
- Create: `app/stores/teamStore.ts`, `app/stores/matchStore.ts`, `app/stores/uiStore.ts`
- Test: `tests/stores.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/stores.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => { setActivePinia(createPinia()) })

vi.stubGlobal('$fetch', vi.fn(async (url: string) => {
  if (url === '/api/teams') return [{ id: 'BRA', name: '巴西', championRate: 18.5 }]
  if (url === '/api/matches') return [{ id: 'M001', status: 'pending' }]
  return []
}))

describe('teamStore', () => {
  it('hydrates teams from /api/teams', async () => {
    const { useTeamStore } = await import('~/stores/teamStore')
    const s = useTeamStore()
    await s.hydrate()
    expect(s.teams).toHaveLength(1)
    expect(s.byId('BRA')?.championRate).toBe(18.5)
  })
})

describe('matchStore', () => {
  it('hydrates matches from /api/matches', async () => {
    const { useMatchStore } = await import('~/stores/matchStore')
    const s = useMatchStore()
    await s.hydrate()
    expect(s.matches).toHaveLength(1)
    expect(s.byId('M001')?.status).toBe('pending')
  })
})

describe('uiStore', () => {
  it('toggles theme', async () => {
    const { useUiStore } = await import('~/stores/uiStore')
    const s = useUiStore()
    expect(s.theme).toBe('light')
    s.toggleTheme()
    expect(s.theme).toBe('dark')
  })
})
```

- [ ] **Step 2: Implement `app/stores/teamStore.ts`**

```ts
import { defineStore } from 'pinia'
import type { Team } from '~/types'

interface TeamWithRate extends Team { championRate: number }

export const useTeamStore = defineStore('team', {
  state: () => ({ teams: [] as TeamWithRate[], loaded: false }),
  getters: {
    byId: (state) => (id: string) => state.teams.find(t => t.id === id),
    byGroup: (state) => (g: string) => state.teams.filter(t => t.group === g),
    top5: (state) => [...state.teams].sort((a,b) => b.championRate - a.championRate).slice(0, 5),
  },
  actions: {
    async hydrate(force = false) {
      if (this.loaded && !force) return
      this.teams = await $fetch<TeamWithRate[]>('/api/teams')
      this.loaded = true
    },
  },
})
```

- [ ] **Step 3: Implement `app/stores/matchStore.ts`**

```ts
import { defineStore } from 'pinia'
import type { Match } from '~/types'

export const useMatchStore = defineStore('match', {
  state: () => ({ matches: [] as Match[], loaded: false }),
  getters: {
    byId: (state) => (id: string) => state.matches.find(m => m.id === id),
    byGroup: (state) => (g: string) => state.matches.filter(m => m.group === g),
    byStage: (state) => (s: Match['stage']) => state.matches.filter(m => m.stage === s),
    today: (state) => {
      const today = new Date().toISOString().slice(0, 10)
      return state.matches.filter(m => m.matchTime.startsWith(today))
    },
    latestEnded: (state) => state.matches
      .filter(m => m.status === 'ended')
      .sort((a, b) => (b.result?.endedAt ?? '').localeCompare(a.result?.endedAt ?? ''))
      .slice(0, 5),
  },
  actions: {
    async hydrate(force = false) {
      if (this.loaded && !force) return
      this.matches = await $fetch<Match[]>('/api/matches')
      this.loaded = true
    },
  },
})
```

- [ ] **Step 4: Implement `app/stores/uiStore.ts`**

```ts
import { defineStore } from 'pinia'

type Theme = 'light' | 'dark'

export const useUiStore = defineStore('ui', {
  state: () => ({ theme: 'light' as Theme, activeGroup: 'A' }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', this.theme === 'dark')
        localStorage.setItem('theme', this.theme)
      }
    },
    initTheme() {
      if (typeof window === 'undefined') return
      const saved = localStorage.getItem('theme') as Theme | null
      const sys: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      this.theme = saved ?? sys
      document.documentElement.classList.toggle('dark', this.theme === 'dark')
    },
    setActiveGroup(g: string) { this.activeGroup = g },
  },
})
```

- [ ] **Step 5: Run tests**

```bash
pnpm test tests/stores.test.ts
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/stores tests/stores.test.ts
git commit -m "feat(stores): add Pinia teamStore, matchStore, uiStore"
```

---

## Task 14: Layout Shell + Mobile Bottom Tab Bar

**Files:**
- Create: `app/layouts/default.vue`, `app/components/AppHeader.vue`, `app/components/MobileTabBar.vue`, `app/components/ThemeToggle.vue`, `app/plugins/init.client.ts`

- [ ] **Step 1: Create theme init plugin**

`app/plugins/init.client.ts`:

```ts
import { useUiStore } from '~/stores/uiStore'
export default defineNuxtPlugin(() => {
  useUiStore().initTheme()
})
```

- [ ] **Step 2: Create `ThemeToggle.vue`**

```vue
<script setup lang="ts">
import { useUiStore } from '~/stores/uiStore'
const ui = useUiStore()
</script>
<template>
  <button
    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[44px] min-h-[44px]"
    :aria-label="ui.theme === 'dark' ? '切换到浅色' : '切换到深色'"
    @click="ui.toggleTheme"
  >
    {{ ui.theme === 'dark' ? '☀️' : '🌙' }}
  </button>
</template>
```

- [ ] **Step 3: Create `AppHeader.vue`**

```vue
<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'
const links = [
  { to: '/', label: '首页' },
  { to: '/groups/A', label: '小组赛' },
  { to: '/knockout', label: '淘汰赛' },
  { to: '/stats', label: '榜单' },
]
</script>
<template>
  <header class="sticky top-0 z-30 bg-white/85 dark:bg-gray-950/85 backdrop-blur border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="font-bold text-lg text-brand">2026 World Cup</NuxtLink>
      <nav class="hidden md:flex gap-6">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to"
          class="text-sm hover:text-brand-accent" active-class="text-brand-accent font-semibold">
          {{ l.label }}
        </NuxtLink>
      </nav>
      <ThemeToggle />
    </div>
  </header>
</template>
```

- [ ] **Step 4: Create `MobileTabBar.vue`**

```vue
<script setup lang="ts">
const tabs = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/groups/A', label: '小组', icon: '🏆' },
  { to: '/knockout', label: '淘汰', icon: '🌳' },
  { to: '/stats', label: '榜单', icon: '📊' },
]
</script>
<template>
  <nav class="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]">
    <div class="grid grid-cols-4 h-16">
      <NuxtLink v-for="t in tabs" :key="t.to" :to="t.to"
        class="flex flex-col items-center justify-center gap-1 text-xs"
        active-class="text-brand-accent">
        <span class="text-lg">{{ t.icon }}</span>
        <span>{{ t.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
```

- [ ] **Step 5: Create `app/layouts/default.vue`**

```vue
<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import MobileTabBar from '~/components/MobileTabBar.vue'
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1 pb-20 md:pb-8">
      <slot />
    </main>
    <MobileTabBar />
  </div>
</template>
```

- [ ] **Step 6: Smoke-check dev server**

```bash
pnpm dev
```

Open `http://localhost:3000`. Expected: header renders with "2026 World Cup" and theme toggle; on viewport <768px, bottom tab bar appears.

- [ ] **Step 7: Commit**

```bash
git add app/layouts app/components/AppHeader.vue app/components/MobileTabBar.vue app/components/ThemeToggle.vue app/plugins
git commit -m "feat(ui): layout shell with header and mobile bottom tab bar"
```

---

## Task 15: Home Page

**Files:**
- Create: `app/pages/index.vue`, `app/components/MatchItem.vue`, `app/components/TopChampionWidget.vue`

- [ ] **Step 1: Create `MatchItem.vue` (reused on multiple pages)**

```vue
<script setup lang="ts">
import type { Match } from '~/types'
import { useTeamStore } from '~/stores/teamStore'

const props = defineProps<{ match: Match }>()
const teamStore = useTeamStore()
const home = computed(() => teamStore.byId(props.match.homeTeamId))
const away = computed(() => teamStore.byId(props.match.awayTeamId))
const time = computed(() => new Date(props.match.matchTime).toLocaleString('zh-CN', {
  month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
}))
</script>
<template>
  <NuxtLink :to="`/matches/${match.id}`"
    class="block p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 min-h-[60px]">
    <div class="flex items-center justify-between text-sm">
      <span class="text-gray-500">{{ time }}</span>
      <span class="px-2 py-0.5 rounded text-xs"
        :class="{
          'bg-gray-200 dark:bg-gray-800': match.status === 'pending',
          'bg-red-100 text-red-700 animate-pulse': match.status === 'live',
          'bg-green-100 text-green-700': match.status === 'ended',
        }">
        {{ { pending: '未开始', live: '进行中', ended: '已结束' }[match.status] }}
      </span>
    </div>
    <div class="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <div class="text-right truncate">{{ home?.name }}</div>
      <div class="text-center font-bold tabular-nums min-w-[64px]">
        <template v-if="match.result">{{ match.result.homeScore }} - {{ match.result.awayScore }}</template>
        <template v-else>VS</template>
      </div>
      <div class="truncate">{{ away?.name }}</div>
    </div>
  </NuxtLink>
</template>
```

- [ ] **Step 2: Create `TopChampionWidget.vue`**

```vue
<script setup lang="ts">
import { useTeamStore } from '~/stores/teamStore'
const teams = useTeamStore()
</script>
<template>
  <section class="rounded-xl bg-gradient-to-br from-brand to-brand-accent p-5 text-white">
    <h2 class="text-lg font-bold mb-3">夺冠概率 TOP 5</h2>
    <ol class="space-y-2">
      <li v-for="(t, i) in teams.top5" :key="t.id" class="flex items-center gap-3">
        <span class="font-bold w-6 text-center">{{ i + 1 }}</span>
        <NuxtLink :to="`/teams/${t.id}`" class="flex-1 truncate hover:underline">{{ t.name }}</NuxtLink>
        <span class="font-mono tabular-nums">{{ t.championRate.toFixed(1) }}%</span>
      </li>
    </ol>
  </section>
</template>
```

- [ ] **Step 3: Create `app/pages/index.vue`**

```vue
<script setup lang="ts">
import { useTeamStore } from '~/stores/teamStore'
import { useMatchStore } from '~/stores/matchStore'
import MatchItem from '~/components/MatchItem.vue'
import TopChampionWidget from '~/components/TopChampionWidget.vue'

const teams = useTeamStore()
const matches = useMatchStore()
await Promise.all([teams.hydrate(), matches.hydrate()])

const todayMatches = computed(() => matches.today)
const latestEnded = computed(() => matches.latestEnded)
</script>
<template>
  <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
    <TopChampionWidget />

    <section>
      <h2 class="text-xl font-bold mb-3">今日赛事</h2>
      <div v-if="todayMatches.length === 0" class="text-gray-500 text-sm py-8 text-center">
        今日无比赛
      </div>
      <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MatchItem v-for="m in todayMatches" :key="m.id" :match="m" />
      </div>
    </section>

    <section>
      <h2 class="text-xl font-bold mb-3">最新赛果</h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MatchItem v-for="m in latestEnded" :key="m.id" :match="m" />
      </div>
    </section>
  </div>
</template>
```

- [ ] **Step 4: Verify in browser**

```bash
pnpm dev
```

Expected: home page renders Top 5 widget, "今日赛事" section, and "最新赛果" section without console errors.

- [ ] **Step 5: Commit**

```bash
git add app/pages/index.vue app/components/MatchItem.vue app/components/TopChampionWidget.vue
git commit -m "feat(home): home page with today's matches, top-5, latest results"
```

---

## Task 16: Group Page (`/groups/[group]`)

**Files:**
- Create: `app/pages/groups/[group].vue`, `app/components/GroupTable.vue`, `app/components/MatchList.vue`, `app/components/QualifyChance.vue`, `app/components/GroupTabs.vue`

- [ ] **Step 1: Create `GroupTabs.vue`**

```vue
<script setup lang="ts">
const groups = ['A','B','C','D','E','F','G','H','I','J','K','L']
const route = useRoute()
const current = computed(() => (route.params.group as string)?.toUpperCase() ?? 'A')
</script>
<template>
  <nav class="overflow-x-auto -mx-4 px-4">
    <div class="flex gap-2 pb-2">
      <NuxtLink v-for="g in groups" :key="g" :to="`/groups/${g}`"
        class="px-4 py-2 rounded-lg text-sm font-semibold border min-w-[44px] text-center"
        :class="g === current
          ? 'bg-brand text-white border-brand'
          : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'">
        {{ g }}
      </NuxtLink>
    </div>
  </nav>
</template>
```

- [ ] **Step 2: Create `GroupTable.vue`**

```vue
<script setup lang="ts">
import type { GroupStanding } from '~/types'
import { useTeamStore } from '~/stores/teamStore'

defineProps<{ standings: GroupStanding[] }>()
const teams = useTeamStore()
const expanded = ref<string | null>(null)
function toggle(id: string) { expanded.value = expanded.value === id ? null : id }
</script>
<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 dark:bg-gray-900 text-xs uppercase">
        <tr>
          <th class="px-3 py-2 text-left">队伍</th>
          <th class="px-2 py-2 text-center hidden sm:table-cell">赛</th>
          <th class="px-2 py-2 text-center">胜</th>
          <th class="px-2 py-2 text-center">平</th>
          <th class="px-2 py-2 text-center">负</th>
          <th class="px-2 py-2 text-center hidden sm:table-cell">进</th>
          <th class="px-2 py-2 text-center hidden sm:table-cell">失</th>
          <th class="px-2 py-2 text-center hidden sm:table-cell">差</th>
          <th class="px-2 py-2 text-center font-bold">分</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row, i) in standings" :key="row.teamId">
          <tr
            class="border-t border-gray-100 dark:border-gray-900 cursor-pointer sm:cursor-default"
            :class="i < 2 ? 'bg-green-50/50 dark:bg-green-950/20' : ''"
            @click="toggle(row.teamId)"
          >
            <td class="px-3 py-2">
              <NuxtLink :to="`/teams/${row.teamId}`" class="font-medium hover:text-brand-accent">
                {{ teams.byId(row.teamId)?.name ?? row.teamId }}
              </NuxtLink>
            </td>
            <td class="px-2 py-2 text-center hidden sm:table-cell">{{ row.played }}</td>
            <td class="px-2 py-2 text-center">{{ row.win }}</td>
            <td class="px-2 py-2 text-center">{{ row.draw }}</td>
            <td class="px-2 py-2 text-center">{{ row.lose }}</td>
            <td class="px-2 py-2 text-center hidden sm:table-cell">{{ row.goalsFor }}</td>
            <td class="px-2 py-2 text-center hidden sm:table-cell">{{ row.goalsAgainst }}</td>
            <td class="px-2 py-2 text-center hidden sm:table-cell">{{ row.goalDiff }}</td>
            <td class="px-2 py-2 text-center font-bold">{{ row.points }}</td>
          </tr>
          <tr v-if="expanded === row.teamId" class="sm:hidden bg-gray-50 dark:bg-gray-900">
            <td colspan="9" class="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
              赛 {{ row.played }} · 进 {{ row.goalsFor }} · 失 {{ row.goalsAgainst }} · 差 {{ row.goalDiff }}
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
```

- [ ] **Step 3: Create `MatchList.vue`**

```vue
<script setup lang="ts">
import type { Match } from '~/types'
import MatchItem from './MatchItem.vue'
defineProps<{ matches: Match[] }>()
</script>
<template>
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <MatchItem v-for="m in matches" :key="m.id" :match="m" />
  </div>
</template>
```

- [ ] **Step 4: Create `QualifyChance.vue`**

```vue
<script setup lang="ts">
import type { GroupStanding } from '~/types'
import { useTeamStore } from '~/stores/teamStore'
const props = defineProps<{ standings: GroupStanding[] }>()
const teams = useTeamStore()

const remainingMatchesPerTeam = 3
const chance = computed(() => {
  return props.standings.map(s => {
    const maxPossible = s.points + (remainingMatchesPerTeam - s.played) * 3
    const minPossible = s.points
    const ratio = (maxPossible - 4) / 6
    const pct = Math.max(0, Math.min(100, ratio * 100))
    return { teamId: s.teamId, pct, locked: minPossible >= 7 }
  })
})
</script>
<template>
  <div class="space-y-2">
    <div v-for="c in chance" :key="c.teamId" class="text-sm">
      <div class="flex justify-between mb-1">
        <span>{{ teams.byId(c.teamId)?.name ?? c.teamId }}</span>
        <span class="tabular-nums">{{ c.locked ? '已晋级' : `${c.pct.toFixed(0)}%` }}</span>
      </div>
      <div class="h-2 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <div class="h-full bg-brand" :style="{ width: c.pct + '%' }" />
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 5: Create `app/pages/groups/[group].vue`**

```vue
<script setup lang="ts">
import GroupTabs from '~/components/GroupTabs.vue'
import GroupTable from '~/components/GroupTable.vue'
import MatchList from '~/components/MatchList.vue'
import QualifyChance from '~/components/QualifyChance.vue'
import { useTeamStore } from '~/stores/teamStore'

const route = useRoute()
const group = computed(() => (route.params.group as string).toUpperCase())
const teams = useTeamStore()
await teams.hydrate()

const { data } = await useFetch(() => `/api/groups/${group.value}`, { watch: [group] })
</script>
<template>
  <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
    <GroupTabs />
    <h1 class="text-2xl font-bold">{{ group }} 组</h1>

    <section>
      <h2 class="text-lg font-semibold mb-3">积分榜</h2>
      <GroupTable v-if="data" :standings="data.standings" />
    </section>

    <section>
      <h2 class="text-lg font-semibold mb-3">出线概率</h2>
      <QualifyChance v-if="data" :standings="data.standings" />
    </section>

    <section>
      <h2 class="text-lg font-semibold mb-3">赛程</h2>
      <MatchList v-if="data" :matches="data.fixtures" />
    </section>
  </div>
</template>
```

- [ ] **Step 6: Verify in browser**

```bash
pnpm dev
```

Visit `http://localhost:3000/groups/A` … `/groups/L`. Expected: tabs render, table shows 4 teams (top 2 highlighted green), qualifying bars render, fixtures list shows.

- [ ] **Step 7: Commit**

```bash
git add app/pages/groups app/components/GroupTabs.vue app/components/GroupTable.vue app/components/MatchList.vue app/components/QualifyChance.vue
git commit -m "feat(groups): group page with standings, qualifying bars, fixtures"
```

---

## Task 17: Team Detail Page (`/teams/[id]`)

**Files:**
- Create: `app/pages/teams/[id].vue`, `app/components/TeamCard.vue`, `app/components/SquadTable.vue`, `app/components/RecordStats.vue`, `app/components/StrengthWeakness.vue`, `app/components/ChampionRateBadge.vue`

- [ ] **Step 1: Create `TeamCard.vue`**

```vue
<script setup lang="ts">
import type { Team } from '~/types'
defineProps<{ team: Team & { championRate: number } }>()
</script>
<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
    <div class="flex items-start gap-4">
      <img :src="team.flag" :alt="team.name" class="w-16 h-12 object-cover rounded shadow"
        loading="lazy" width="64" height="48" />
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-bold truncate">{{ team.name }}</h1>
        <p class="text-sm text-gray-500">{{ team.nameEn }} · 第 {{ team.group }} 组</p>
        <div class="mt-2 flex flex-wrap gap-2 text-xs">
          <span class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">FIFA 排名: {{ team.fifaRank }}</span>
          <span class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">积分: {{ team.fifaPoint }}</span>
          <span class="px-2 py-1 rounded bg-brand/10 text-brand">{{ team.style }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Create `SquadTable.vue`**

```vue
<script setup lang="ts">
import type { Player } from '~/types'
defineProps<{ players: Player[] }>()
const groups = computed(() => ({
  GK: 'props' as const,
  DF: 'props' as const,
  MF: 'props' as const,
  FW: 'props' as const,
}))
const positionLabel = { GK: '门将', DF: '后卫', MF: '中场', FW: '前锋' } as const
</script>
<template>
  <div class="space-y-4">
    <div v-for="pos in (['GK','DF','MF','FW'] as const)" :key="pos">
      <h3 class="font-semibold mb-2 text-sm text-gray-500">{{ positionLabel[pos] }}</h3>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <div v-for="p in players.filter(x => x.position === pos)" :key="p.id"
          class="flex items-center gap-3 p-2 rounded-lg border border-gray-200 dark:border-gray-800 min-h-[44px]">
          <span class="font-bold text-brand w-8 text-center tabular-nums">{{ p.number }}</span>
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate">{{ p.name }}</div>
            <div class="text-xs text-gray-500 truncate">{{ p.club }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Create `RecordStats.vue`**

```vue
<script setup lang="ts">
import type { RecentRecord } from '~/types'
const props = defineProps<{ record: RecentRecord }>()
const winRate = computed(() => Math.round((props.record.win / props.record.matches) * 100))
const drawRate = computed(() => Math.round((props.record.draw / props.record.matches) * 100))
const loseRate = computed(() => 100 - winRate.value - drawRate.value)
</script>
<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
    <h2 class="font-semibold">近 12 个月战绩</h2>
    <div class="grid grid-cols-3 gap-3 text-center">
      <div><div class="text-2xl font-bold">{{ record.matches }}</div><div class="text-xs text-gray-500">出战</div></div>
      <div><div class="text-2xl font-bold text-green-600">{{ record.win }}</div><div class="text-xs text-gray-500">胜</div></div>
      <div><div class="text-2xl font-bold text-gray-500">{{ record.draw }}</div><div class="text-xs text-gray-500">平</div></div>
    </div>
    <div class="flex h-3 rounded overflow-hidden">
      <div class="bg-green-500" :style="{ width: winRate + '%' }" />
      <div class="bg-gray-400" :style="{ width: drawRate + '%' }" />
      <div class="bg-red-400" :style="{ width: loseRate + '%' }" />
    </div>
    <div class="grid grid-cols-3 gap-3 text-center text-sm">
      <div><div class="font-bold">{{ record.goalsFor }}</div><div class="text-xs text-gray-500">进球</div></div>
      <div><div class="font-bold">{{ record.goalsAgainst }}</div><div class="text-xs text-gray-500">失球</div></div>
      <div><div class="font-bold">{{ record.avgPoints.toFixed(2) }}</div><div class="text-xs text-gray-500">场均积分</div></div>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Create `StrengthWeakness.vue`**

```vue
<script setup lang="ts">
defineProps<{ strength: string[]; weakness: string[] }>()
</script>
<template>
  <div class="grid sm:grid-cols-2 gap-4">
    <div class="rounded-xl p-4 bg-green-50 dark:bg-green-950/30">
      <h3 class="font-semibold text-green-700 dark:text-green-400 mb-2">优势</h3>
      <ul class="space-y-1 text-sm">
        <li v-for="s in strength" :key="s">· {{ s }}</li>
      </ul>
    </div>
    <div class="rounded-xl p-4 bg-red-50 dark:bg-red-950/30">
      <h3 class="font-semibold text-red-700 dark:text-red-400 mb-2">短板</h3>
      <ul class="space-y-1 text-sm">
        <li v-for="w in weakness" :key="w">· {{ w }}</li>
      </ul>
    </div>
  </div>
</template>
```

- [ ] **Step 5: Create `ChampionRateBadge.vue`**

```vue
<script setup lang="ts">
defineProps<{ rate: number }>()
</script>
<template>
  <div class="rounded-xl bg-gradient-to-br from-brand to-brand-accent p-5 text-white text-center">
    <div class="text-xs uppercase opacity-80">夺冠概率</div>
    <div class="text-4xl font-bold tabular-nums">{{ rate.toFixed(1) }}%</div>
  </div>
</template>
```

- [ ] **Step 6: Create `app/pages/teams/[id].vue`**

```vue
<script setup lang="ts">
import TeamCard from '~/components/TeamCard.vue'
import SquadTable from '~/components/SquadTable.vue'
import RecordStats from '~/components/RecordStats.vue'
import StrengthWeakness from '~/components/StrengthWeakness.vue'
import ChampionRateBadge from '~/components/ChampionRateBadge.vue'
import { useTeamStore } from '~/stores/teamStore'
import { useMatchStore } from '~/stores/matchStore'
import MatchItem from '~/components/MatchItem.vue'

const route = useRoute()
const id = computed(() => route.params.id as string)

const teams = useTeamStore()
const matches = useMatchStore()
await Promise.all([teams.hydrate(), matches.hydrate()])

const team = computed(() => teams.byId(id.value))
if (!team.value) throw createError({ statusCode: 404, statusMessage: 'Team not found' })

const { data: players } = await useFetch<any[]>(() => '/_data/players.json',
  { transform: (all: any) => all[id.value] ?? [] })

const teamMatches = computed(() =>
  matches.matches.filter(m => m.homeTeamId === id.value || m.awayTeamId === id.value)
)
</script>
<template>
  <div v-if="team" class="max-w-6xl mx-auto px-4 py-6 space-y-6">
    <TeamCard :team="team" />
    <ChampionRateBadge :rate="team.championRate" />

    <RecordStats :record="team.recentRecord" />

    <StrengthWeakness :strength="team.strength" :weakness="team.weakness" />

    <section>
      <h2 class="text-lg font-bold mb-3">阵容</h2>
      <SquadTable :players="players ?? []" />
    </section>

    <section>
      <h2 class="text-lg font-bold mb-3">本届赛程</h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MatchItem v-for="m in teamMatches" :key="m.id" :match="m" />
      </div>
    </section>
  </div>
</template>
```

- [ ] **Step 7: Add `/api/players/[id]` route to serve squad**

Create `server/api/players/[id].get.ts`:

```ts
import { defineEventHandler, getRouterParam, createError } from 'h3'
import players from '~~/app/data/players.json'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const squad = (players as any)[id]
  if (!squad) throw createError({ statusCode: 404 })
  return squad
})
```

Update team page to use it:

```vue
const { data: players } = await useFetch<any[]>(() => `/api/players/${id.value}`, { watch: [id] })
```

- [ ] **Step 8: Verify in browser**

```bash
pnpm dev
```

Visit `http://localhost:3000/teams/BRA`. Expected: team card, championship %, record stats, strength/weakness, squad list grouped by position, schedule.

- [ ] **Step 9: Commit**

```bash
git add app/pages/teams app/components/TeamCard.vue app/components/SquadTable.vue app/components/RecordStats.vue app/components/StrengthWeakness.vue app/components/ChampionRateBadge.vue server/api/players
git commit -m "feat(teams): team detail page with squad, stats, strengths"
```

---

## Task 18: Match Detail Page (`/matches/[id]`)

**Files:**
- Create: `app/pages/matches/[id].vue`, `app/components/RecentFormCompare.vue`, `app/components/ProbabilityBar.vue`, `app/components/PredictedScore.vue`, `app/components/KeyFactors.vue`

- [ ] **Step 1: Create `ProbabilityBar.vue`**

```vue
<script setup lang="ts">
defineProps<{ homeWin: number; draw: number; awayWin: number; homeName: string; awayName: string }>()
</script>
<template>
  <div>
    <div class="flex h-8 rounded overflow-hidden text-xs font-semibold text-white">
      <div class="bg-brand flex items-center justify-center" :style="{ width: homeWin + '%' }"
        :title="`${homeName} 胜 ${homeWin}%`">{{ homeWin }}%</div>
      <div class="bg-gray-500 flex items-center justify-center" :style="{ width: draw + '%' }"
        title="平局">{{ draw }}%</div>
      <div class="bg-brand-accent flex items-center justify-center" :style="{ width: awayWin + '%' }"
        :title="`${awayName} 胜 ${awayWin}%`">{{ awayWin }}%</div>
    </div>
    <div class="mt-1 grid grid-cols-3 text-xs text-gray-500">
      <span>{{ homeName }} 胜</span>
      <span class="text-center">平</span>
      <span class="text-right">{{ awayName }} 胜</span>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Create `PredictedScore.vue`**

```vue
<script setup lang="ts">
defineProps<{ bestScore: string; confidence: number; homeName: string; awayName: string }>()
</script>
<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-5 text-center">
    <div class="text-xs text-gray-500 uppercase">预测比分</div>
    <div class="my-2 text-3xl font-bold tabular-nums">
      <span>{{ homeName }}</span>
      <span class="mx-3 text-brand-accent">{{ bestScore }}</span>
      <span>{{ awayName }}</span>
    </div>
    <div class="text-xs text-gray-500">信心指数 {{ Math.round(confidence * 100) }}%</div>
  </div>
</template>
```

- [ ] **Step 3: Create `RecentFormCompare.vue`**

```vue
<script setup lang="ts">
import type { Team } from '~/types'
defineProps<{ home: Team; away: Team }>()
</script>
<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
    <h3 class="font-semibold mb-4 text-center">近 12 个月战绩对比</h3>
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div class="text-center">
        <div class="font-bold">{{ home.name }}</div>
        <div class="text-xs text-gray-500 mb-2">{{ home.recentRecord.matches }} 战</div>
      </div>
      <div class="text-center">
        <div class="font-bold">{{ away.name }}</div>
        <div class="text-xs text-gray-500 mb-2">{{ away.recentRecord.matches }} 战</div>
      </div>
    </div>
    <div class="space-y-3 text-sm">
      <div v-for="row in [
        { label: '胜', h: home.recentRecord.win, a: away.recentRecord.win },
        { label: '平', h: home.recentRecord.draw, a: away.recentRecord.draw },
        { label: '负', h: home.recentRecord.lose, a: away.recentRecord.lose },
        { label: '进球', h: home.recentRecord.goalsFor, a: away.recentRecord.goalsFor },
        { label: '失球', h: home.recentRecord.goalsAgainst, a: away.recentRecord.goalsAgainst },
        { label: '场均得分', h: home.recentRecord.avgPoints, a: away.recentRecord.avgPoints },
      ]" :key="row.label" class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div class="text-right tabular-nums">{{ row.h }}</div>
        <div class="text-xs text-gray-500 px-2 min-w-[60px] text-center">{{ row.label }}</div>
        <div class="tabular-nums">{{ row.a }}</div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Create `KeyFactors.vue`**

```vue
<script setup lang="ts">
const factors = [
  { label: 'FIFA 排名', weight: 25 },
  { label: '近一年胜率', weight: 25 },
  { label: '攻防数据', weight: 20 },
  { label: '小组赛表现', weight: 15 },
  { label: '阵容完整度', weight: 15 },
]
</script>
<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
    <h3 class="font-semibold mb-3">预测权重</h3>
    <div class="space-y-2 text-sm">
      <div v-for="f in factors" :key="f.label" class="flex items-center gap-3">
        <span class="w-24">{{ f.label }}</span>
        <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
          <div class="h-full bg-brand" :style="{ width: f.weight * 4 + '%' }" />
        </div>
        <span class="tabular-nums w-10 text-right">{{ f.weight }}%</span>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 5: Create `app/pages/matches/[id].vue`**

```vue
<script setup lang="ts">
import RecentFormCompare from '~/components/RecentFormCompare.vue'
import ProbabilityBar from '~/components/ProbabilityBar.vue'
import PredictedScore from '~/components/PredictedScore.vue'
import KeyFactors from '~/components/KeyFactors.vue'
import { useTeamStore } from '~/stores/teamStore'

const route = useRoute()
const id = computed(() => route.params.id as string)

const teams = useTeamStore()
await teams.hydrate()

const { data: match } = await useFetch<any>(() => `/api/matches/${id.value}`, { watch: [id] })

const home = computed(() => match.value && teams.byId(match.value.homeTeamId))
const away = computed(() => match.value && teams.byId(match.value.awayTeamId))
</script>
<template>
  <div v-if="match && home && away" class="max-w-3xl mx-auto px-4 py-6 space-y-5">
    <h1 class="text-xl font-bold text-center">
      <NuxtLink :to="`/teams/${home.id}`" class="hover:text-brand">{{ home.name }}</NuxtLink>
      <span class="mx-3 text-gray-400">VS</span>
      <NuxtLink :to="`/teams/${away.id}`" class="hover:text-brand">{{ away.name }}</NuxtLink>
    </h1>
    <p class="text-sm text-gray-500 text-center">
      {{ new Date(match.matchTime).toLocaleString('zh-CN') }} · {{ match.venue }}
    </p>

    <PredictedScore v-if="match.prediction"
      :best-score="match.prediction.bestScore"
      :confidence="match.prediction.confidence"
      :home-name="home.name" :away-name="away.name" />

    <ProbabilityBar v-if="match.prediction"
      :home-win="match.prediction.homeWin"
      :draw="match.prediction.draw"
      :away-win="match.prediction.awayWin"
      :home-name="home.name" :away-name="away.name" />

    <RecentFormCompare :home="home" :away="away" />
    <KeyFactors />
  </div>
</template>
```

- [ ] **Step 6: Verify in browser**

Visit `http://localhost:3000/matches/M001`. Expected: predicted score, probability bar (sums to 100%), form comparison table, weight chart.

- [ ] **Step 7: Commit**

```bash
git add app/pages/matches app/components/RecentFormCompare.vue app/components/ProbabilityBar.vue app/components/PredictedScore.vue app/components/KeyFactors.vue
git commit -m "feat(matches): match detail page with prediction, form comparison"
```

---

## Task 19: Knockout Page (`/knockout`)

**Files:**
- Create: `app/pages/knockout.vue`, `app/components/KnockoutTree.vue`, `app/components/ChampionLeaderboard.vue`

- [ ] **Step 1: Create `KnockoutTree.vue`**

Note: SVG bracket on desktop; vertical stacked rounds on mobile. The mobile breakpoint switches via Tailwind `md:`.

```vue
<script setup lang="ts">
import type { Match, MatchStage } from '~/types'
import { useTeamStore } from '~/stores/teamStore'

const props = defineProps<{ bracket: Record<MatchStage, Match[]> }>()
const teams = useTeamStore()
const stages: { key: MatchStage; label: string }[] = [
  { key: 'r16', label: '16 强' },
  { key: 'qf', label: '8 强' },
  { key: 'sf', label: '半决赛' },
  { key: 'final', label: '决赛' },
]
const activeIndex = ref(0)
const teamName = (id: string) => teams.byId(id)?.name ?? id
function eliminated(m: Match, side: 'home'|'away'): boolean {
  if (m.status !== 'ended' || !m.result) return false
  return side === 'home'
    ? m.result.homeScore < m.result.awayScore
    : m.result.awayScore < m.result.homeScore
}
</script>
<template>
  <div>
    <div class="md:hidden mb-3 flex gap-2 overflow-x-auto">
      <button v-for="(s, i) in stages" :key="s.key"
        class="px-3 py-2 rounded text-xs font-semibold border min-w-[64px]"
        :class="i === activeIndex ? 'bg-brand text-white border-brand' : 'border-gray-300 dark:border-gray-700'"
        @click="activeIndex = i">{{ s.label }}</button>
    </div>

    <div class="md:hidden space-y-3">
      <div v-for="m in props.bracket[stages[activeIndex].key]" :key="m.id"
        class="rounded-lg border border-gray-200 dark:border-gray-800 p-3 text-sm">
        <div class="flex justify-between" :class="eliminated(m,'home') ? 'opacity-40 line-through' : ''">
          <span>{{ teamName(m.homeTeamId) }}</span>
          <span class="tabular-nums">{{ m.result?.homeScore ?? '-' }}</span>
        </div>
        <div class="flex justify-between" :class="eliminated(m,'away') ? 'opacity-40 line-through' : ''">
          <span>{{ teamName(m.awayTeamId) }}</span>
          <span class="tabular-nums">{{ m.result?.awayScore ?? '-' }}</span>
        </div>
      </div>
    </div>

    <div class="hidden md:grid gap-4 overflow-x-auto pb-4"
      :style="`grid-template-columns: repeat(${stages.length}, minmax(180px, 1fr));`">
      <div v-for="s in stages" :key="s.key" class="space-y-3">
        <h3 class="text-center text-xs uppercase font-semibold text-gray-500">{{ s.label }}</h3>
        <div v-for="m in props.bracket[s.key]" :key="m.id"
          class="rounded-lg border border-gray-200 dark:border-gray-800 p-2 text-sm">
          <div class="flex justify-between" :class="eliminated(m,'home') ? 'opacity-40 line-through' : ''">
            <span class="truncate">{{ teamName(m.homeTeamId) }}</span>
            <span class="tabular-nums">{{ m.result?.homeScore ?? '-' }}</span>
          </div>
          <div class="flex justify-between" :class="eliminated(m,'away') ? 'opacity-40 line-through' : ''">
            <span class="truncate">{{ teamName(m.awayTeamId) }}</span>
            <span class="tabular-nums">{{ m.result?.awayScore ?? '-' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Create `ChampionLeaderboard.vue`**

```vue
<script setup lang="ts">
import { useTeamStore } from '~/stores/teamStore'
const props = defineProps<{ rates: Record<string, number> }>()
const teams = useTeamStore()
const sorted = computed(() =>
  Object.entries(props.rates)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([id, v]) => ({ id, rate: v, team: teams.byId(id) }))
)
</script>
<template>
  <ol class="rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
    <li v-for="(item, i) in sorted" :key="item.id" class="flex items-center gap-3 p-3">
      <span class="w-6 text-center font-bold tabular-nums">{{ i + 1 }}</span>
      <NuxtLink v-if="item.team" :to="`/teams/${item.id}`" class="flex-1 truncate hover:text-brand-accent">
        {{ item.team.name }}
      </NuxtLink>
      <div class="w-32 h-2 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
        <div class="h-full bg-gradient-to-r from-brand to-brand-accent" :style="{ width: Math.min(100, item.rate * 4) + '%' }" />
      </div>
      <span class="font-mono tabular-nums w-14 text-right">{{ item.rate.toFixed(1) }}%</span>
    </li>
  </ol>
</template>
```

- [ ] **Step 3: Create `app/pages/knockout.vue`**

```vue
<script setup lang="ts">
import KnockoutTree from '~/components/KnockoutTree.vue'
import ChampionLeaderboard from '~/components/ChampionLeaderboard.vue'
import { useTeamStore } from '~/stores/teamStore'

const teams = useTeamStore()
await teams.hydrate()

const { data } = await useFetch<any>('/api/knockout')
</script>
<template>
  <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
    <h1 class="text-2xl font-bold">淘汰赛对阵图</h1>
    <KnockoutTree v-if="data" :bracket="data.bracket" />

    <h2 class="text-xl font-bold pt-4">实时夺冠概率</h2>
    <ChampionLeaderboard v-if="data" :rates="data.championRates" />
  </div>
</template>
```

- [ ] **Step 4: Verify in browser**

Visit `http://localhost:3000/knockout`. Expected: bracket renders horizontal grid on desktop, stacked tabs on mobile (`< 768px`); leaderboard sorted descending.

- [ ] **Step 5: Commit**

```bash
git add app/pages/knockout.vue app/components/KnockoutTree.vue app/components/ChampionLeaderboard.vue
git commit -m "feat(knockout): bracket page with mobile-stacked rounds and leaderboard"
```

---

## Task 20: Stats Page (`/stats`)

**Files:**
- Create: `app/pages/stats.vue`, `server/api/stats.get.ts`

- [ ] **Step 1: Create stats API route**

Create `server/api/stats.get.ts`:

```ts
import { defineEventHandler, useRuntimeConfig, createError } from 'h3'
import { kv } from '@vercel/kv'

interface Scorer { rank: number; player: { name: string; nationality: string }; team: { tla: string }; goals: number }
interface StatsCache { scorers: Scorer[]; updatedAt: string }

const STATS_KEY = 'stats:scorers'
const STALE_MINUTES = 30

export default defineEventHandler(async () => {
  const cached = await kv.get<StatsCache>(STATS_KEY)
  const fresh = cached && (Date.now() - new Date(cached.updatedAt).getTime()) < STALE_MINUTES * 60_000
  if (fresh) return cached

  const config = useRuntimeConfig()
  const token = config.footballDataApiKey
  if (!token) throw createError({ statusCode: 500, statusMessage: 'API key not configured' })

  const res = await fetch('https://api.football-data.org/v4/competitions/WC/scorers', {
    headers: { 'X-Auth-Token': token },
  })
  if (!res.ok) {
    if (cached) return cached
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch scorers' })
  }
  const data = await res.json() as { scorers: any[] }
  const scorers: Scorer[] = data.scorers.slice(0, 30).map((s, i) => ({
    rank: i + 1,
    player: { name: s.player?.name ?? 'Unknown', nationality: s.player?.nationality ?? '' },
    team: { tla: s.team?.tla ?? '' },
    goals: s.goals ?? s.numberOfGoals ?? 0,
  }))
  const result: StatsCache = { scorers, updatedAt: new Date().toISOString() }
  await kv.set(STATS_KEY, result)
  return result
})
```

- [ ] **Step 2: Create `app/pages/stats.vue`**

```vue
<script setup lang="ts">
const { data, error } = await useFetch<any>('/api/stats')
</script>
<template>
  <div class="max-w-3xl mx-auto px-4 py-6 space-y-4">
    <h1 class="text-2xl font-bold">射手榜</h1>
    <p v-if="data?.updatedAt" class="text-xs text-gray-500">
      更新于 {{ new Date(data.updatedAt).toLocaleString('zh-CN') }}
    </p>
    <div v-if="error" class="text-red-500 text-sm">榜单暂不可用，请稍后重试</div>
    <ol v-else-if="data" class="rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
      <li v-for="s in data.scorers" :key="s.rank" class="p-3 flex items-center gap-3 text-sm">
        <span class="w-8 text-center font-bold">{{ s.rank }}</span>
        <span class="flex-1 truncate">{{ s.player.name }}</span>
        <span class="text-xs text-gray-500 w-16">{{ s.team.tla }}</span>
        <span class="font-bold tabular-nums w-10 text-right">{{ s.goals }}</span>
      </li>
    </ol>
  </div>
</template>
```

- [ ] **Step 3: Verify**

Visit `http://localhost:3000/stats`. Expected: list rendered (or graceful error before tournament starts and no scorers exist).

- [ ] **Step 4: Commit**

```bash
git add app/pages/stats.vue server/api/stats.get.ts
git commit -m "feat(stats): scorers leaderboard with 30-minute KV cache"
```

---

## Task 21: Vercel Cron + Deployment Config

**Files:**
- Create: `vercel.json`, `.vercelignore`, `README.md` (deployment notes only)

- [ ] **Step 1: Create `vercel.json`**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    { "path": "/api/sync", "schedule": "0 2,9,14,22 * * *" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

> Note: Vercel Hobby cron only invokes `GET` by default. Update sync handler to also accept `GET` from cron.

- [ ] **Step 2: Add `GET` variant to sync handler**

Rename `server/api/sync.post.ts` → `server/api/sync.ts` and use unified handler:

```ts
import { defineEventHandler, getHeader, getMethod, createError, useRuntimeConfig } from 'h3'
import { runSync } from '~~/server/utils/syncEngine'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  if (method !== 'GET' && method !== 'POST') {
    throw createError({ statusCode: 405 })
  }
  const cronAuth = getHeader(event, 'authorization')
  if (process.env.CRON_SECRET && cronAuth !== `Bearer ${process.env.CRON_SECRET}`) {
    throw createError({ statusCode: 401 })
  }
  const token = useRuntimeConfig().footballDataApiKey
  if (!token) throw createError({ statusCode: 500, statusMessage: 'API key not configured' })
  return await runSync(token)
})
```

Update `tests/api-matches.test.ts` references and any imports that pointed at `sync.post.ts` (none yet — only the cron route).

- [ ] **Step 3: Create `.vercelignore`**

```
.nuxt
.output
node_modules
tests
docs
coverage
```

- [ ] **Step 4: Create deployment README section**

Create `README.md`:

```markdown
# 2026 World Cup Predictions

Nuxt 4 web app for the 2026 FIFA World Cup with live predictions.

## Local development

```bash
pnpm install
cp .env.example .env  # fill in FOOTBALL_DATA_API_KEY
pnpm dev
```

## Tests

```bash
pnpm test
pnpm typecheck
```

## Deploy to Vercel

1. Push to GitHub.
2. Import repo on Vercel (Hobby tier is enough).
3. Set environment variables:
   - `FOOTBALL_DATA_API_KEY` — get one at https://www.football-data.org/client/register
   - `CRON_SECRET` — random string; passed as `Authorization: Bearer ...` by Vercel cron
4. Add the Vercel KV integration from the Vercel dashboard → Storage → KV.
5. Deploy. Cron job will run at 02:00 / 09:00 / 14:00 / 22:00 UTC.
```

- [ ] **Step 5: Verify build passes**

```bash
pnpm typecheck
pnpm build
```

Expected: both succeed.

- [ ] **Step 6: Commit**

```bash
git add vercel.json .vercelignore README.md server/api/sync.ts
git rm server/api/sync.post.ts 2>/dev/null || true
git commit -m "feat(deploy): Vercel cron config and unified sync handler"
```

---

## Task 22: Mobile + E2E Smoke Verification

**Files:** none (verification only)

- [ ] **Step 1: Run full test suite**

```bash
pnpm test
pnpm typecheck
```

Expected: all pass.

- [ ] **Step 2: Build production bundle**

```bash
pnpm build
pnpm preview &
sleep 4
```

- [ ] **Step 3: Mobile breakpoint check**

In Chrome DevTools → Device Toolbar → iPhone SE (375 × 667). Visit each route:

| Route | Check |
|---|---|
| `/` | Bottom tab bar visible; no horizontal scroll |
| `/groups/A` | Group tabs scroll horizontally; table compact (Team/W/D/L/Pts only) |
| `/teams/BRA` | Squad list 1-column; no overflow |
| `/matches/M001` | Probability bar full-width; predicted score readable |
| `/knockout` | Round tab buttons; only 1 round shown at a time |
| `/stats` | Single-column list |

If any layout breaks, fix the offending component (likely missing `truncate` or `min-w-0` on a flex child).

- [ ] **Step 4: Lighthouse mobile audit**

In Chrome DevTools → Lighthouse → Mobile → Performance + Accessibility.

Targets:
- Performance ≥ 90
- Accessibility ≥ 95
- Best Practices ≥ 95

If Performance < 90, check: image dimensions set, no large unused JS, fonts use `font-display: swap`.

- [ ] **Step 5: API quota sanity test**

```bash
curl -X GET http://localhost:3000/api/sync \
  -H "Authorization: Bearer $CRON_SECRET"
```

Expected: JSON `{ "updated": 0 }` (no live matches yet) or `{ "updated": N }` if any have ended. No 401, no 5xx.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: complete mobile + E2E smoke verification" --allow-empty
```

---

## Spec Coverage Map

| Spec section | Implemented in |
|---|---|
| §1 Architecture | Tasks 0, 7, 8–12 |
| §2.1 Local JSON | Task 2 |
| §2.2 KV cache | Task 7 |
| §2.3 Football-Data.org client | Task 6 |
| §3.1 Team Info | Task 17 |
| §3.2 Group Stage | Tasks 10, 16 |
| §3.3 Match Prediction | Tasks 4, 9, 18 |
| §3.4 Knockout | Tasks 11, 19 |
| §3.5 Home | Task 15 |
| §3.6 Stats | Task 20 |
| §4 API routes | Tasks 8–12, 17 (players), 20 (stats) |
| §5.1 Match algorithm | Task 4 |
| §5.2 Champion algorithm | Task 5 |
| §6 Cron | Tasks 12, 21 |
| §7 Pinia stores | Task 13 |
| §8 Deployment | Task 21 |
| §9 Directory | Task 0 + structure across all tasks |
| §10 Error handling | Task 6 (429), Task 9 (404), Task 12 (sync error), Task 20 (stale-cache fallback) |
| §11 Mobile | Tasks 14, 16 (table), 17 (squad cards), 19 (round tabs), 22 (verification) |
| §12 Phases | All P0 in scope |

All P0 features from §12 are covered. Stats (P1) and probability trend chart (P1) — stats included via Task 20. The probability-trend sparkline is intentionally deferred per spec phasing; if needed, add a follow-up plan that reads historical `champion_rates` snapshots stored per-day in KV.








