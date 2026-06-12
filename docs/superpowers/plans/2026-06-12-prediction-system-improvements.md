# Prediction System Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace simplistic score prediction with Poisson distribution model, display actual results for ended matches, and add homepage accuracy statistics widget.

**Architecture:** Poisson-based score prediction generates probability matrix of all 0-5 score combinations. Top 3 scores extracted with raw probabilities (not normalized). Ended-match details show actual result alongside prediction. Sync engine calculates and caches accuracy stats; homepage widget displays them.

**Tech Stack:** Vue 3 Composition API, Nuxt 3, TypeScript, Pinia stores, Tailwind CSS, Vercel KV

---

## File Structure

**New files:**
- `app/utils/poissonPrediction.ts` - Poisson distribution helper functions
- `app/components/MatchResult.vue` - Display actual final score with prediction accuracy badges
- `app/components/AccuracyStats.vue` - Homepage prediction accuracy widget
- `server/api/accuracy-stats.get.ts` - GET endpoint for accuracy statistics
- `tests/poissonPrediction.test.ts` - Tests for Poisson helper functions

**Modified files:**
- `app/types/index.ts` - Add `ScorePrediction` type, update `Prediction` interface
- `app/utils/predictAlgorithm.ts` - Replace sigmoid with Poisson distribution model
- `app/components/PredictedScore.vue` - Display TOP 3 scores with raw probabilities
- `app/pages/matches/[id].vue` - Add MatchResult conditional render for ended matches
- `app/pages/index.vue` - Add AccuracyStats next to TopChampionWidget
- `server/utils/kvClient.ts` - Add accuracy stats KV functions
- `server/utils/syncEngine.ts` - Calculate and cache accuracy stats after sync
- `tests/predictAlgorithm.test.ts` - Update tests for new Prediction shape

---

## Task 1: Create Poisson Helper Functions

**Files:**
- Create: `app/utils/poissonPrediction.ts`
- Create: `tests/poissonPrediction.test.ts`

- [ ] **Step 1: Write failing test for poisson PMF function**

Create `tests/poissonPrediction.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { poisson, scoreMatrix, topScores } from '~/utils/poissonPrediction'

describe('poisson', () => {
  it('returns e^-lambda for k=0', () => {
    expect(poisson(0, 1)).toBeCloseTo(Math.exp(-1), 5)
  })

  it('returns lambda * e^-lambda for k=1', () => {
    expect(poisson(1, 1)).toBeCloseTo(Math.exp(-1), 5)
    expect(poisson(1, 2)).toBeCloseTo(2 * Math.exp(-2), 5)
  })

  it('produces valid probability distribution that sums to ~1', () => {
    let sum = 0
    for (let k = 0; k <= 20; k++) sum += poisson(k, 1.5)
    expect(sum).toBeCloseTo(1, 3)
  })
})

describe('scoreMatrix', () => {
  it('returns 36 cells (6x6 grid for 0-5 goals)', () => {
    const m = scoreMatrix(1.5, 1.2)
    expect(m.length).toBe(36)
  })

  it('cells contain home, away, probability fields', () => {
    const m = scoreMatrix(1.5, 1.2)
    expect(m[0]).toEqual({
      home: 0,
      away: 0,
      probability: expect.any(Number),
    })
  })

  it('all probabilities are non-negative', () => {
    const m = scoreMatrix(1.5, 1.2)
    for (const cell of m) {
      expect(cell.probability).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('topScores', () => {
  it('returns 3 entries sorted by probability descending', () => {
    const top = topScores(2.0, 0.8)
    expect(top.length).toBe(3)
    expect(top[0].probability).toBeGreaterThanOrEqual(top[1].probability)
    expect(top[1].probability).toBeGreaterThanOrEqual(top[2].probability)
  })

  it('formats score as "h-a" string', () => {
    const top = topScores(1.5, 1.0)
    for (const s of top) {
      expect(s.score).toMatch(/^\d-\d$/)
    }
  })

  it('produces different top scores for asymmetric strengths', () => {
    const strong = topScores(2.5, 0.5)
    expect(strong[0].score).not.toBe('0-0')
    const homeGoals = parseInt(strong[0].score.split('-')[0])
    const awayGoals = parseInt(strong[0].score.split('-')[1])
    expect(homeGoals).toBeGreaterThan(awayGoals)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/poissonPrediction.test.ts`
Expected: FAIL with "Cannot find module '~/utils/poissonPrediction'"

- [ ] **Step 3: Implement poisson helpers**

Create `app/utils/poissonPrediction.ts`:

```typescript
export interface ScoreCell {
  home: number
  away: number
  probability: number
}

export interface ScorePrediction {
  score: string
  probability: number
}

const MAX_GOALS = 5

export function poisson(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0
  let result = Math.exp(-lambda)
  for (let i = 1; i <= k; i++) {
    result *= lambda / i
  }
  return result
}

export function scoreMatrix(lambdaHome: number, lambdaAway: number): ScoreCell[] {
  const cells: ScoreCell[] = []
  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      cells.push({
        home: h,
        away: a,
        probability: poisson(h, lambdaHome) * poisson(a, lambdaAway),
      })
    }
  }
  return cells
}

export function topScores(lambdaHome: number, lambdaAway: number, count = 3): ScorePrediction[] {
  return scoreMatrix(lambdaHome, lambdaAway)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, count)
    .map(c => ({ score: `${c.home}-${c.away}`, probability: c.probability }))
}

export function aggregateOutcome(matrix: ScoreCell[]): { homeWin: number; draw: number; awayWin: number } {
  let homeWin = 0, draw = 0, awayWin = 0
  for (const cell of matrix) {
    if (cell.home > cell.away) homeWin += cell.probability
    else if (cell.home < cell.away) awayWin += cell.probability
    else draw += cell.probability
  }
  const total = homeWin + draw + awayWin
  return {
    homeWin: (homeWin / total) * 100,
    draw: (draw / total) * 100,
    awayWin: (awayWin / total) * 100,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test tests/poissonPrediction.test.ts`
Expected: PASS (all tests green)

- [ ] **Step 5: Commit**

```bash
git add app/utils/poissonPrediction.ts tests/poissonPrediction.test.ts
git commit -m "feat: add Poisson distribution helpers for score prediction"
```

---

## Task 2: Update Prediction Type

**Files:**
- Modify: `app/types/index.ts:58-64`

- [ ] **Step 1: Update Prediction interface**

Replace lines 58-64:

```typescript
export interface ScorePrediction {
  score: string
  probability: number
}

export interface Prediction {
  homeWin: number
  draw: number
  awayWin: number
  bestScore: string
  topScores: ScorePrediction[]
  confidence: number
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `pnpm typecheck 2>&1 | head -30`
Expected: Errors only in files using Prediction (predictAlgorithm.ts, components) — these will be fixed in subsequent tasks

- [ ] **Step 3: Commit**

```bash
git add app/types/index.ts
git commit -m "feat: extend Prediction type with topScores"
```

---

## Task 3: Replace Prediction Algorithm With Poisson Model

**Files:**
- Modify: `app/utils/predictAlgorithm.ts` (full rewrite)
- Modify: `tests/predictAlgorithm.test.ts`

- [ ] **Step 1: Update existing tests for new Prediction shape**

Replace contents of `tests/predictAlgorithm.test.ts`:

```typescript
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
    const home = team('BRA', 1, { win: 11, draw: 3, lose: 2, goalsFor: 32, goalsAgainst: 9, avgGoals: 2.1, avgConceded: 0.6 })
    const away = team('JAM', 60, { win: 3, draw: 2, lose: 6, goalsFor: 10, goalsAgainst: 21, avgGoals: 0.9, avgConceded: 1.9 })
    const p = predictMatch(home, away, [], [])
    expect(p.homeWin + p.draw + p.awayWin).toBeCloseTo(100, 0)
  })

  it('favors stronger team', () => {
    const home = team('BRA', 1, { win: 11, draw: 3, lose: 2, goalsFor: 32, goalsAgainst: 9, avgGoals: 2.1, avgConceded: 0.6 })
    const away = team('JAM', 60, { win: 3, draw: 2, lose: 6, goalsFor: 10, goalsAgainst: 21, avgGoals: 0.9, avgConceded: 1.9 })
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

  it('returns TOP 3 scores with valid format', () => {
    const home = team('BRA', 1, {})
    const away = team('JAM', 60, {})
    const p = predictMatch(home, away, [], [])
    expect(p.topScores.length).toBe(3)
    for (const s of p.topScores) {
      expect(s.score).toMatch(/^\d+-\d+$/)
      expect(s.probability).toBeGreaterThan(0)
      expect(s.probability).toBeLessThanOrEqual(1)
    }
  })

  it('TOP 3 scores are sorted by probability descending', () => {
    const home = team('BRA', 1, {})
    const away = team('JAM', 60, {})
    const p = predictMatch(home, away, [], [])
    expect(p.topScores[0].probability).toBeGreaterThanOrEqual(p.topScores[1].probability)
    expect(p.topScores[1].probability).toBeGreaterThanOrEqual(p.topScores[2].probability)
  })

  it('bestScore equals first entry of topScores', () => {
    const home = team('BRA', 1, {})
    const away = team('JAM', 60, {})
    const p = predictMatch(home, away, [], [])
    expect(p.bestScore).toBe(p.topScores[0].score)
  })

  it('produces varied scores (not always 3-2)', () => {
    const matchups = [
      [team('A', 1, { avgGoals: 2.5, avgConceded: 0.5 }), team('B', 80, { avgGoals: 0.8, avgConceded: 2.5 })],
      [team('A', 30, { avgGoals: 1.2, avgConceded: 1.2 }), team('B', 32, { avgGoals: 1.2, avgConceded: 1.2 })],
      [team('A', 50, { avgGoals: 0.9, avgConceded: 1.5 }), team('B', 5, { avgGoals: 2.2, avgConceded: 0.7 })],
      [team('A', 15, { avgGoals: 1.5, avgConceded: 1.0 }), team('B', 18, { avgGoals: 1.4, avgConceded: 1.1 })],
    ]
    const scores = matchups.map(([h, a]) => predictMatch(h, a, [], []).bestScore)
    const unique = new Set(scores)
    expect(unique.size).toBeGreaterThan(1)
  })

  it('returns confidence in [0, 1]', () => {
    const home = team('BRA', 1, {})
    const away = team('JAM', 60, {})
    const p = predictMatch(home, away, [], [])
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

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/predictAlgorithm.test.ts`
Expected: FAIL with type errors (no `topScores` field) or missing values

- [ ] **Step 3: Rewrite predictAlgorithm.ts with Poisson model**

Replace contents of `app/utils/predictAlgorithm.ts`:

```typescript
import type { Team, GroupStanding, Player, Prediction } from '~/types'
import { scoreMatrix, topScores, aggregateOutcome } from './poissonPrediction'

const W = { rank: 0.25, form: 0.25, attack: 0.20, group: 0.15, squad: 0.15 } as const
const LEAGUE_AVG_GOALS = 1.4
const HOME_ADVANTAGE = 1.15

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

function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x))
}

function expectedGoals(
  attackingTeam: Team,
  defendingTeam: Team,
  powerFactor: number,
  isHome: boolean
): number {
  const base = attackingTeam.recentRecord.avgGoals
  const defenseAdjustment = defendingTeam.recentRecord.avgConceded / LEAGUE_AVG_GOALS
  const powerAdjustment = 1 + powerFactor * 0.3
  const homeMultiplier = isHome ? HOME_ADVANTAGE : 1
  return clamp(base * defenseAdjustment * powerAdjustment * homeMultiplier, 0.1, 5)
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
  const powerFactor = (homePower - awayPower) / 100

  const lambdaHome = expectedGoals(home, away, powerFactor, true)
  const lambdaAway = expectedGoals(away, home, -powerFactor, false)

  const matrix = scoreMatrix(lambdaHome, lambdaAway)
  const top = topScores(lambdaHome, lambdaAway, 3)
  const outcome = aggregateOutcome(matrix)

  const confidence = Math.min(1, Math.abs(homePower - awayPower) / 30)

  return {
    homeWin: Math.round(outcome.homeWin * 10) / 10,
    draw: Math.round(outcome.draw * 10) / 10,
    awayWin: Math.round(outcome.awayWin * 10) / 10,
    topScores: top,
    bestScore: top[0].score,
    confidence: Math.round(confidence * 100) / 100,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test tests/predictAlgorithm.test.ts`
Expected: PASS (all tests green, including diversity test)

- [ ] **Step 5: Run full test suite to ensure no regressions**

Run: `pnpm test`
Expected: All test files pass

- [ ] **Step 6: Commit**

```bash
git add app/utils/predictAlgorithm.ts tests/predictAlgorithm.test.ts
git commit -m "feat: replace score prediction with Poisson distribution model"
```

---

## Task 4: Update PredictedScore Component for TOP 3

**Files:**
- Modify: `app/components/PredictedScore.vue` (full rewrite)

- [ ] **Step 1: Rewrite PredictedScore component**

Replace contents of `app/components/PredictedScore.vue`:

```vue
<script setup lang="ts">
import type { ScorePrediction } from '~/types'

const props = defineProps<{
  topScores: ScorePrediction[]
  confidence: number
  homeName: string
  awayName: string
  actualScore?: string
}>()

const isMatched = (score: string) => props.actualScore === score
</script>
<template>
  <div class="card-refined p-5">
    <div class="text-xs text-stone-500 dark:text-gray-400 uppercase tracking-wide text-center mb-3">
      赛前预测 TOP 3
    </div>
    <ul class="space-y-2">
      <li v-for="(item, i) in topScores" :key="item.score"
        :class="[
          'flex items-center justify-between px-4 py-3 rounded-xl',
          isMatched(item.score)
            ? 'bg-wc-green/10 border border-wc-green/30'
            : 'bg-stone-50 dark:bg-gray-800/50',
        ]">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-stone-200 dark:bg-gray-700 text-stone-700 dark:text-gray-200 text-sm font-bold flex items-center justify-center">
            {{ i + 1 }}
          </span>
          <span class="text-2xl font-bold tabular-nums dark:text-gray-100">
            <span class="text-stone-600 dark:text-gray-400 text-base font-medium mr-2">{{ homeName }}</span>
            <span class="text-brand-accent">{{ item.score }}</span>
            <span class="text-stone-600 dark:text-gray-400 text-base font-medium ml-2">{{ awayName }}</span>
          </span>
        </div>
        <span class="text-sm font-semibold tabular-nums text-stone-600 dark:text-gray-300">
          {{ (item.probability * 100).toFixed(1) }}%
        </span>
      </li>
    </ul>
    <div class="text-xs text-stone-500 dark:text-gray-400 text-center mt-3">
      信心指数 {{ Math.round(confidence * 100) }}%
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify file compiles**

Run: `pnpm typecheck 2>&1 | grep "PredictedScore" | head -10`
Expected: No errors specific to PredictedScore.vue

- [ ] **Step 3: Commit**

```bash
git add app/components/PredictedScore.vue
git commit -m "feat: display top 3 predicted scores with raw probabilities"
```

---

## Task 5: Create MatchResult Component

**Files:**
- Create: `app/components/MatchResult.vue`

- [ ] **Step 1: Create MatchResult component**

Create `app/components/MatchResult.vue`:

```vue
<script setup lang="ts">
const props = defineProps<{
  homeName: string
  awayName: string
  homeScore: number
  awayScore: number
  predictedScore: string
  predictedHomeWin: number
  predictedDraw: number
  predictedAwayWin: number
}>()

const actualOutcome = computed<'home' | 'draw' | 'away'>(() => {
  if (props.homeScore > props.awayScore) return 'home'
  if (props.homeScore < props.awayScore) return 'away'
  return 'draw'
})

const predictedOutcome = computed<'home' | 'draw' | 'away'>(() => {
  const max = Math.max(props.predictedHomeWin, props.predictedDraw, props.predictedAwayWin)
  if (props.predictedHomeWin === max) return 'home'
  if (props.predictedAwayWin === max) return 'away'
  return 'draw'
})

const outcomeCorrect = computed(() => actualOutcome.value === predictedOutcome.value)

const actualScoreString = computed(() => `${props.homeScore}-${props.awayScore}`)
const scoreCorrect = computed(() => props.predictedScore === actualScoreString.value)
</script>
<template>
  <div class="card-refined p-6 text-center">
    <div class="text-xs text-stone-500 dark:text-gray-400 uppercase tracking-wide mb-3">
      实际比分
    </div>
    <div class="text-4xl font-bold tabular-nums dark:text-gray-100 mb-4">
      <span class="text-stone-600 dark:text-gray-400 text-xl font-medium mr-3">{{ homeName }}</span>
      <span>{{ homeScore }}-{{ awayScore }}</span>
      <span class="text-stone-600 dark:text-gray-400 text-xl font-medium ml-3">{{ awayName }}</span>
    </div>
    <div class="flex justify-center gap-2 flex-wrap">
      <span :class="[
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold',
        outcomeCorrect
          ? 'bg-wc-green/15 text-wc-green'
          : 'bg-stone-200 text-stone-600 dark:bg-gray-700 dark:text-gray-300',
      ]">
        <span>{{ outcomeCorrect ? '✓' : '✗' }}</span>
        <span>胜负预测{{ outcomeCorrect ? '正确' : '错误' }}</span>
      </span>
      <span :class="[
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold',
        scoreCorrect
          ? 'bg-wc-gold/15 text-amber-600 dark:text-wc-gold'
          : 'bg-stone-200 text-stone-600 dark:bg-gray-700 dark:text-gray-300',
      ]">
        <span>{{ scoreCorrect ? '✓' : '✗' }}</span>
        <span>比分预测{{ scoreCorrect ? '正确' : '错误' }}</span>
      </span>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify file compiles**

Run: `pnpm typecheck 2>&1 | grep "MatchResult" | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/components/MatchResult.vue
git commit -m "feat: add match result component with prediction accuracy badges"
```

---

## Task 6: Update Match Detail Page

**Files:**
- Modify: `app/pages/matches/[id].vue` (full rewrite)

- [ ] **Step 1: Rewrite match detail page**

Replace contents of `app/pages/matches/[id].vue`:

```vue
<script setup lang="ts">
import RecentFormCompare from '~/components/RecentFormCompare.vue'
import ProbabilityBar from '~/components/ProbabilityBar.vue'
import PredictedScore from '~/components/PredictedScore.vue'
import MatchResult from '~/components/MatchResult.vue'
import KeyFactors from '~/components/KeyFactors.vue'
import { useTeamStore } from '~/stores/teamStore'

const route = useRoute()
const id = computed(() => route.params.id as string)

const teams = useTeamStore()
await teams.hydrate()

const { data: match } = await useFetch<any>(() => `/api/matches/${id.value}`, { watch: [id] })

const home = computed(() => match.value && teams.byId(match.value.homeTeamId))
const away = computed(() => match.value && teams.byId(match.value.awayTeamId))

const isEnded = computed(() => match.value?.status === 'ended' && match.value?.result)
const actualScore = computed(() => isEnded.value
  ? `${match.value.result.homeScore}-${match.value.result.awayScore}`
  : undefined)
</script>
<template>
  <div v-if="match && home && away" class="max-w-3xl mx-auto px-4 py-6 space-y-5">
    <h1 class="text-xl font-bold text-center dark:text-gray-100">
      <NuxtLink :to="`/teams/${home.id}`" class="hover:text-brand">{{ home.name }}</NuxtLink>
      <span class="mx-3 text-gray-400 dark:text-gray-500">VS</span>
      <NuxtLink :to="`/teams/${away.id}`" class="hover:text-brand">{{ away.name }}</NuxtLink>
    </h1>
    <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
      {{ new Date(match.matchTime).toLocaleString('zh-CN') }} · {{ match.venue }}
    </p>

    <MatchResult v-if="isEnded && match.prediction"
      :home-name="home.name" :away-name="away.name"
      :home-score="match.result.homeScore" :away-score="match.result.awayScore"
      :predicted-score="match.prediction.bestScore"
      :predicted-home-win="match.prediction.homeWin"
      :predicted-draw="match.prediction.draw"
      :predicted-away-win="match.prediction.awayWin" />

    <PredictedScore v-if="match.prediction"
      :top-scores="match.prediction.topScores"
      :confidence="match.prediction.confidence"
      :home-name="home.name" :away-name="away.name"
      :actual-score="actualScore" />

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

- [ ] **Step 2: Verify the page compiles**

Run: `pnpm typecheck 2>&1 | grep "matches/\[id\]" | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/pages/matches/[id].vue
git commit -m "feat: show actual result and prediction comparison for ended matches"
```

---

## Task 7: Add Accuracy Stats KV Functions

**Files:**
- Modify: `server/utils/kvClient.ts`

- [ ] **Step 1: Add AccuracyStats type and KV functions**

Append to `server/utils/kvClient.ts`:

```typescript

export interface AccuracyStats {
  total: number
  outcomeCorrect: number
  scoreCorrect: number
  updatedAt: string
}

export async function setAccuracyStats(stats: AccuracyStats): Promise<void> {
  if (!kvAvailable()) return
  await kv.set('accuracy:stats', stats)
}

export async function getAccuracyStats(): Promise<AccuracyStats | null> {
  if (!kvAvailable()) return null
  return (await kv.get<AccuracyStats>('accuracy:stats')) ?? null
}
```

- [ ] **Step 2: Verify file compiles**

Run: `pnpm typecheck 2>&1 | grep "kvClient" | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add server/utils/kvClient.ts
git commit -m "feat: add accuracy stats KV storage functions"
```

---

## Task 8: Calculate Accuracy Stats in Sync Engine

**Files:**
- Modify: `server/utils/syncEngine.ts`

- [ ] **Step 1: Add accuracy calculation logic**

Replace contents of `server/utils/syncEngine.ts`:

```typescript
import schedule from '~~/app/data/schedule.json'
import teamsJson from '~~/app/data/teams.json'
import recordsJson from '~~/app/data/recentRecords.json'
import playersJson from '~~/app/data/players.json'
import groupsJson from '~~/app/data/groups.json'
import { fetchWorldCupMatches } from './footballDataClient'
import {
  setMatchResult, setChampionRates, getMatchResult, setChampionRatesHistory,
  setAccuracyStats,
} from './kvClient'
import { calcChampionRates } from '~/utils/probabilityCalc'
import { calcGroupStandings } from '~/utils/standingsCalc'
import { predictMatch } from '~/utils/predictAlgorithm'
import type { Team, Match } from '~/types'

interface SyncResult { updated: number; error?: string }

function externalIdMatches(localMatch: any, ext: any): boolean {
  if (localMatch.homeTeamId !== ext.homeTla) return false
  if (localMatch.awayTeamId !== ext.awayTla) return false
  const localTime = new Date(localMatch.matchTime).getTime()
  const extTime = new Date(ext.utcDate).getTime()
  return Math.abs(localTime - extTime) < 6 * 60 * 60 * 1000
}

async function computeAliveTeams(): Promise<Set<string>> {
  return new Set<string>(Object.keys(teamsJson))
}

function buildTeam(id: string): Team | null {
  const t = (teamsJson as any)[id]
  if (!t) return null
  return { ...t, recentRecord: (recordsJson as any)[id] }
}

async function calculateAccuracy(): Promise<void> {
  const endedMatches: Array<{ match: any; result: { homeScore: number; awayScore: number } }> = []
  for (const m of schedule as any[]) {
    const cached = await getMatchResult(m.id)
    if (cached?.status === 'ended' && cached.homeScore !== null && cached.awayScore !== null) {
      endedMatches.push({
        match: m,
        result: { homeScore: cached.homeScore, awayScore: cached.awayScore },
      })
    }
  }

  let outcomeCorrect = 0
  let scoreCorrect = 0
  for (const { match, result } of endedMatches) {
    const home = buildTeam(match.homeTeamId)
    const away = buildTeam(match.awayTeamId)
    if (!home || !away) continue

    let standings: ReturnType<typeof calcGroupStandings> = []
    if (match.group) {
      const groupTeams = (groupsJson as any)[match.group] as string[]
      const groupMatches: Match[] = []
      for (const gm of (schedule as any[]).filter(g => g.group === match.group)) {
        const c = await getMatchResult(gm.id)
        groupMatches.push(c
          ? { ...gm, status: c.status, result: c.status === 'ended'
              ? { homeScore: c.homeScore, awayScore: c.awayScore, endedAt: c.endedAt! } : undefined }
          : gm)
      }
      standings = calcGroupStandings(groupTeams, groupMatches)
    }

    const prediction = predictMatch(
      home, away, standings,
      (playersJson as any)[away.id] ?? [],
      (playersJson as any)[home.id] ?? [],
    )

    const actualHome = result.homeScore
    const actualAway = result.awayScore
    const actualOutcome = actualHome > actualAway ? 'home' : actualHome < actualAway ? 'away' : 'draw'
    const max = Math.max(prediction.homeWin, prediction.draw, prediction.awayWin)
    const predictedOutcome = prediction.homeWin === max ? 'home' : prediction.awayWin === max ? 'away' : 'draw'

    if (actualOutcome === predictedOutcome) outcomeCorrect++
    if (prediction.bestScore === `${actualHome}-${actualAway}`) scoreCorrect++
  }

  await setAccuracyStats({
    total: endedMatches.length,
    outcomeCorrect,
    scoreCorrect,
    updatedAt: new Date().toISOString(),
  })
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

    const today = new Date().toISOString().slice(0, 10)
    await setChampionRatesHistory(today, rates)

    await calculateAccuracy()

    return { updated }
  } catch (e: any) {
    return { updated, error: e.message ?? String(e) }
  }
}
```

- [ ] **Step 2: Verify compilation**

Run: `pnpm typecheck 2>&1 | grep "syncEngine" | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add server/utils/syncEngine.ts
git commit -m "feat: calculate prediction accuracy stats during sync"
```

---

## Task 9: Create Accuracy Stats API Endpoint

**Files:**
- Create: `server/api/accuracy-stats.get.ts`

- [ ] **Step 1: Create API endpoint with fallback to live calculation**

Create `server/api/accuracy-stats.get.ts`:

```typescript
import { defineEventHandler } from 'h3'
import schedule from '~~/app/data/schedule.json'
import teamsJson from '~~/app/data/teams.json'
import recordsJson from '~~/app/data/recentRecords.json'
import playersJson from '~~/app/data/players.json'
import groupsJson from '~~/app/data/groups.json'
import { getAccuracyStats, getMatchResult, type AccuracyStats } from '~~/server/utils/kvClient'
import { calcGroupStandings } from '~/utils/standingsCalc'
import { predictMatch } from '~/utils/predictAlgorithm'
import type { Team, Match } from '~/types'

function buildTeam(id: string): Team | null {
  const t = (teamsJson as any)[id]
  if (!t) return null
  return { ...t, recentRecord: (recordsJson as any)[id] }
}

async function liveCalculate(): Promise<AccuracyStats> {
  let total = 0, outcomeCorrect = 0, scoreCorrect = 0
  for (const m of schedule as any[]) {
    const cached = await getMatchResult(m.id)
    if (cached?.status !== 'ended' || cached.homeScore === null || cached.awayScore === null) continue
    total++

    const home = buildTeam(m.homeTeamId)
    const away = buildTeam(m.awayTeamId)
    if (!home || !away) continue

    let standings: ReturnType<typeof calcGroupStandings> = []
    if (m.group) {
      const groupTeams = (groupsJson as any)[m.group] as string[]
      const groupMatches: Match[] = []
      for (const gm of (schedule as any[]).filter(g => g.group === m.group)) {
        const c = await getMatchResult(gm.id)
        groupMatches.push(c
          ? { ...gm, status: c.status, result: c.status === 'ended'
              ? { homeScore: c.homeScore, awayScore: c.awayScore, endedAt: c.endedAt! } : undefined }
          : gm)
      }
      standings = calcGroupStandings(groupTeams, groupMatches)
    }

    const prediction = predictMatch(
      home, away, standings,
      (playersJson as any)[away.id] ?? [],
      (playersJson as any)[home.id] ?? [],
    )

    const actualOutcome = cached.homeScore > cached.awayScore ? 'home' : cached.homeScore < cached.awayScore ? 'away' : 'draw'
    const max = Math.max(prediction.homeWin, prediction.draw, prediction.awayWin)
    const predictedOutcome = prediction.homeWin === max ? 'home' : prediction.awayWin === max ? 'away' : 'draw'

    if (actualOutcome === predictedOutcome) outcomeCorrect++
    if (prediction.bestScore === `${cached.homeScore}-${cached.awayScore}`) scoreCorrect++
  }
  return { total, outcomeCorrect, scoreCorrect, updatedAt: new Date().toISOString() }
}

export default defineEventHandler(async () => {
  const cached = await getAccuracyStats()
  if (cached) return cached
  return await liveCalculate()
})
```

- [ ] **Step 2: Test the endpoint**

Run: `curl -s http://localhost:3000/api/accuracy-stats`
Expected: JSON response with `total`, `outcomeCorrect`, `scoreCorrect`, `updatedAt`

- [ ] **Step 3: Commit**

```bash
git add server/api/accuracy-stats.get.ts
git commit -m "feat: add accuracy stats API endpoint"
```

---

## Task 10: Create AccuracyStats Component

**Files:**
- Create: `app/components/AccuracyStats.vue`

- [ ] **Step 1: Create the component**

Create `app/components/AccuracyStats.vue`:

```vue
<script setup lang="ts">
interface AccuracyStats {
  total: number
  outcomeCorrect: number
  scoreCorrect: number
  updatedAt: string
}

const { data } = await useFetch<AccuracyStats>('/api/accuracy-stats')

const outcomePercent = computed(() => {
  if (!data.value || data.value.total === 0) return 0
  return Math.round((data.value.outcomeCorrect / data.value.total) * 100)
})

const scorePercent = computed(() => {
  if (!data.value || data.value.total === 0) return 0
  return Math.round((data.value.scoreCorrect / data.value.total) * 100)
})

const hasData = computed(() => data.value && data.value.total > 0)
</script>
<template>
  <section class="card-refined p-6 bg-gradient-to-br from-stone-50 to-white dark:from-gray-800 dark:to-gray-900">
    <div class="flex items-center gap-3 mb-5">
      <div class="w-12 h-12 rounded-2xl bg-wc-blue/10 flex items-center justify-center text-2xl">
        📊
      </div>
      <div>
        <h2 class="text-xl font-bold dark:text-gray-100">预测战绩</h2>
        <p class="text-xs text-stone-500 dark:text-gray-400 font-medium">
          已结束 {{ data?.total ?? 0 }} 场
        </p>
      </div>
    </div>

    <div v-if="!hasData" class="text-center py-8 text-stone-500 dark:text-gray-400 text-sm">
      暂无数据，等待比赛结束
    </div>

    <div v-else class="space-y-4">
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium dark:text-gray-300">胜平负预测</span>
          <span class="text-sm font-bold tabular-nums dark:text-gray-100">
            {{ outcomePercent }}% ({{ data?.outcomeCorrect }}/{{ data?.total }})
          </span>
        </div>
        <div class="h-2 rounded-full bg-stone-200 dark:bg-gray-700 overflow-hidden">
          <div class="h-full bg-wc-green transition-all" :style="{ width: outcomePercent + '%' }"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium dark:text-gray-300">比分完全准确</span>
          <span class="text-sm font-bold tabular-nums dark:text-gray-100">
            {{ scorePercent }}% ({{ data?.scoreCorrect }}/{{ data?.total }})
          </span>
        </div>
        <div class="h-2 rounded-full bg-stone-200 dark:bg-gray-700 overflow-hidden">
          <div class="h-full bg-wc-gold transition-all" :style="{ width: scorePercent + '%' }"></div>
        </div>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 2: Verify file compiles**

Run: `pnpm typecheck 2>&1 | grep "AccuracyStats" | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/components/AccuracyStats.vue
git commit -m "feat: add accuracy stats homepage widget"
```

---

## Task 11: Integrate AccuracyStats Into Homepage

**Files:**
- Modify: `app/pages/index.vue:5-6,58-60`

- [ ] **Step 1: Update homepage layout**

In `app/pages/index.vue`, add AccuracyStats import after line 5:

```typescript
import AccuracyStats from '~/components/AccuracyStats.vue'
```

Replace lines 58-60 (the `<!-- TOP 5 -->` section + TopChampionWidget) with:

```vue
      <!-- TOP 5 + Accuracy Stats -->
      <div class="grid gap-4 md:grid-cols-2">
        <TopChampionWidget />
        <AccuracyStats />
      </div>
```

- [ ] **Step 2: Verify the page compiles**

Run: `pnpm typecheck 2>&1 | grep "index.vue" | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat: integrate accuracy stats widget into homepage"
```

---

## Task 12: Trigger Sync to Generate Accuracy Stats

**Files:**
- Test: Live API call

- [ ] **Step 1: Trigger sync to populate accuracy stats**

Run: `curl -X POST http://localhost:3000/api/sync`
Expected: `{"updated": <number>}` response

- [ ] **Step 2: Verify accuracy stats endpoint returns data**

Run: `curl -s http://localhost:3000/api/accuracy-stats | head -c 200`
Expected: JSON with `total`, `outcomeCorrect`, `scoreCorrect`, `updatedAt`

- [ ] **Step 3: Verify match detail API returns topScores**

Run: `curl -s http://localhost:3000/api/matches/M001 | head -c 500`
Expected: JSON with `prediction.topScores` array of 3 entries

---

## Task 13: Manual Testing

**Files:**
- Test: All components integrated

- [ ] **Step 1: Test homepage layout**

Open http://localhost:3000 in browser.
Verify:
- TopChampionWidget on left, AccuracyStats on right (desktop)
- Both stack vertically on mobile (resize < 768px)
- Accuracy bars show correct percentages

- [ ] **Step 2: Test pending match detail page**

Open `/matches/M001` (or any pending match).
Verify:
- TOP 3 predicted scores display with probabilities
- Scores are NOT all "3-2" — should vary based on teams
- Probability bar, recent form, key factors render correctly
- No MatchResult component visible

- [ ] **Step 3: Test ended match detail page**

Open detail page for an ended match (check `/api/matches` for one with status 'ended').
Verify:
- MatchResult component shows actual score prominently
- Two badges show outcome correct/incorrect and score correct/incorrect
- TOP 3 predictions still display, with matching score highlighted in green if applicable
- Probability bar shows pre-match prediction

- [ ] **Step 4: Test refresh button updates accuracy**

Click the refresh button in header.
Verify:
- Toast appears with success message
- Accuracy stats widget refreshes (may need page reload to fully reflect)

- [ ] **Step 5: Test diversity of predictions**

Open 5+ different match detail pages.
Verify:
- Different matches show different TOP scores
- Stronger teams produce higher probability for higher home scores
- Even teams produce balanced predictions

---

## Self-Review Checklist

**Spec Coverage:**
- ✅ Poisson distribution model (Tasks 1, 3)
- ✅ TOP 3 score predictions with raw probabilities (Tasks 1, 3, 4)
- ✅ Updated Prediction type (Task 2)
- ✅ MatchResult component for ended matches (Task 5)
- ✅ Match detail page integration (Task 6)
- ✅ KV storage for accuracy stats (Task 7)
- ✅ Accuracy calculation in sync (Task 8)
- ✅ Accuracy stats API endpoint (Task 9)
- ✅ AccuracyStats component (Task 10)
- ✅ Homepage integration (Task 11)
- ✅ End-to-end verification (Tasks 12-13)

**Placeholder Scan:** None — all code blocks contain complete implementations

**Type Consistency:**
- `ScorePrediction` (used in Task 1, 2, 4) — `{ score: string, probability: number }`
- `Prediction.topScores: ScorePrediction[]` (Task 2, used in Tasks 3, 4, 6)
- `Prediction.bestScore` retained for backwards compat (Task 2, 3) = `topScores[0].score`
- `AccuracyStats` (Tasks 7, 8, 9, 10) — same fields throughout
- `lambdaHome`, `lambdaAway` consistent in poissonPrediction.ts and predictAlgorithm.ts

**Dependencies:**
- Task 2 depends on nothing
- Task 1 depends on nothing
- Task 3 depends on Tasks 1, 2
- Task 4 depends on Task 2
- Task 5 depends on nothing
- Task 6 depends on Tasks 4, 5
- Task 7 depends on nothing
- Task 8 depends on Tasks 3, 7
- Task 9 depends on Task 7 (and Task 3 indirectly)
- Task 10 depends on Task 9
- Task 11 depends on Task 10
- Tasks 12-13 depend on all previous

---

## Notes

**Approximation in accuracy calculation**: We generate predictions for already-ended matches using current data (which may have been updated based on those matches). This is an acceptable approximation — true pre-match snapshot storage is deferred as a future enhancement.

**Why MAX_GOALS = 5**: Covers 99%+ of real football matches. Matches with 6+ goals from one team are rare (~0.1% historically). Limiting to 5 keeps the matrix to 36 cells (manageable computation, fast).

**Why no probability normalization**: Per design decision — raw Poisson probabilities communicate prediction confidence honestly. A 12.5% top score reveals high uncertainty; a 25% top score reveals strong conviction.

**Algorithm tuning constants**: `LEAGUE_AVG_GOALS=1.4`, `HOME_ADVANTAGE=1.15`, `powerFactor weight=0.3` are chosen based on standard football statistics research. These can be tuned later if accuracy stats reveal systematic bias.
