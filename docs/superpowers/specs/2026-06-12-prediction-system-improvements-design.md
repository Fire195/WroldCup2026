# Prediction System Improvements Design

**Date**: 2026-06-12
**Feature**: Improve prediction algorithm, ended-match display, and add accuracy statistics

## Overview

Three coordinated improvements to the prediction system:

1. **Score prediction algorithm** - Replace simplistic rounding with Poisson distribution model
2. **Ended-match details page** - Show actual result alongside pre-match prediction
3. **Accuracy statistics** - New homepage widget showing outcome and score prediction accuracy

## Motivation

**Current problems**:
- Score prediction always returns "3-2" regardless of teams (algorithm bug)
- Ended matches show predicted score but not the actual result
- No visibility into how accurate predictions have been

**Goals**:
- Predictions should reflect actual team strengths and produce varied, realistic scores
- Users can compare predictions to actual results
- Trust in predictions builds via transparent accuracy tracking

## Part 1: Score Prediction Algorithm

### Current Algorithm Issue

The `bestScoreline` function in `app/utils/predictAlgorithm.ts`:

```typescript
function bestScoreline(homeAvgGoals, awayAvgGoals, homeWin, awayWin): string {
  let h = Math.round(homeAvgGoals)  // ~1.5 → 2
  let a = Math.round(awayAvgGoals)  // ~1.3 → 1
  if (homeWin > awayWin && h <= a) h = a + 1  // forces h > a
  // ... forces close scores when probabilities are similar
  return `${h}-${a}`
}
```

Most teams have `avgGoals` between 1.0-2.0, rounding to 1 or 2. Combined with the "must reflect winner" logic, the function consistently produces "3-2" for matches where home team wins.

### New Algorithm: Poisson Distribution Model

Football match scores follow approximately a Poisson distribution. Each team's expected goals (λ) determines the probability of scoring exactly k goals:

```
P(X = k) = (λ^k × e^(-λ)) / k!
```

**Step 1: Calculate expected goals (lambda)**

```typescript
const LEAGUE_AVG_GOALS = 1.4  // World Cup average

// Power factor: how much team strength differs (-1 to +1)
const powerFactor = (homePower - awayPower) / 100

// Home expected goals
const lambdaHome =
  home.recentRecord.avgGoals                    // Base attack rate
  * (away.recentRecord.avgConceded / LEAGUE_AVG_GOALS)  // Defense adjustment
  * (1 + powerFactor * 0.3)                     // Power gap influence
  * 1.15                                         // Home advantage multiplier

// Away expected goals (no home advantage)
const lambdaAway =
  away.recentRecord.avgGoals
  * (home.recentRecord.avgConceded / LEAGUE_AVG_GOALS)
  * (1 - powerFactor * 0.3)

// Clamp to reasonable range
const clamp = (x: number) => Math.max(0.1, Math.min(5, x))
```

**Step 2: Calculate score probability matrix**

```typescript
function poisson(k: number, lambda: number): number {
  // P(X = k) = (lambda^k * e^-lambda) / k!
  let result = Math.exp(-lambda)
  for (let i = 1; i <= k; i++) {
    result *= lambda / i
  }
  return result
}

// Calculate all combinations 0-5 vs 0-5 (covers ~99% of real matches)
const matrix: Array<{ home: number; away: number; probability: number }> = []
for (let h = 0; h <= 5; h++) {
  for (let a = 0; a <= 5; a++) {
    matrix.push({
      home: h,
      away: a,
      probability: poisson(h, lambdaHome) * poisson(a, lambdaAway),
    })
  }
}
```

**Step 3: Extract TOP 3 most likely scores**

```typescript
const topScores = matrix
  .sort((a, b) => b.probability - a.probability)
  .slice(0, 3)
  .map(s => ({
    score: `${s.home}-${s.away}`,
    probability: s.probability,  // Real Poisson probability, NOT normalized
  }))
```

**Step 4: Aggregate outcome probabilities from matrix**

```typescript
let homeWin = 0, draw = 0, awayWin = 0
for (const cell of matrix) {
  if (cell.home > cell.away) homeWin += cell.probability
  else if (cell.home < cell.away) awayWin += cell.probability
  else draw += cell.probability
}
// These will sum to ~99% (since we cap at 5 goals)
// Normalize to sum to 100% for display
const total = homeWin + draw + awayWin
homeWin = (homeWin / total) * 100
draw = (draw / total) * 100
awayWin = (awayWin / total) * 100
```

### Updated Prediction Type

```typescript
interface ScorePrediction {
  score: string         // e.g., "2-1"
  probability: number   // Real Poisson probability, e.g., 0.0823
}

interface Prediction {
  homeWin: number       // 0-100, normalized
  draw: number
  awayWin: number
  topScores: ScorePrediction[]  // TOP 3, raw probabilities
  bestScore: string     // Kept for backwards compat = topScores[0].score
  confidence: number    // 0-1
}
```

### Algorithm Rationale

- **Poisson is well-established** for modeling football goals (used in betting markets)
- **Independent home/away λ** allows asymmetric scorelines (e.g., 3-0 vs 0-3)
- **Power factor adjustment** captures team strength differences beyond just historical goals
- **Home advantage 1.15x** reflects standard home-team boost in football data
- **No score normalization** - users see real probabilities (12.5%, 8.3%, etc.) which gives a clearer picture of prediction confidence

## Part 2: Ended Match Details Page

### Current State

The matches detail page (`app/pages/matches/[id].vue`) shows the prediction regardless of match status. There's no display of actual result.

### New Layout

**For ended matches:**

```
墨西哥  VS  南非
2026/6/12 03:00:00 · Estadio Azteca

┌─────────────────────────────────┐
│         实际比分                  │
│      墨西哥 2-1 南非              │
│      ✓ 胜负预测正确              │ (green badge)
│      ✗ 比分预测错误              │ (gray badge)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      赛前预测 TOP 3              │
│      3-2 (12.5%)                │
│      2-1 (10.8%)  ← 实际比分     │
│      2-0 (8.3%)                 │
│      信心指数 65%                │
└─────────────────────────────────┘

[赛前胜平负概率条]
[近 12 个月战绩对比]
[预测权重]
```

**For pending/live matches:**
- No actual result block
- Show TOP 3 predicted scores instead of single bestScore
- Rest unchanged

### New/Modified Components

**New: `app/components/MatchResult.vue`**
- Displays actual final score
- Shows prediction accuracy badges (outcome correct, score correct)
- Only renders when match.status === 'ended'

**Modified: `app/components/PredictedScore.vue`**
- Display TOP 3 scores instead of single bestScore
- Each score shows raw probability (e.g., "3-2  12.5%")
- Highlight matched score if actual result is in TOP 3

**Modified: `app/pages/matches/[id].vue`**
- Conditionally render MatchResult before PredictedScore
- Pass actual result to PredictedScore for highlighting

## Part 3: Accuracy Statistics

### Calculation Logic

After each `runSync()` call, calculate accuracy stats:

1. Get all matches with `status === 'ended'`
2. For each ended match:
   - Generate prediction using `predictMatch(home, away, ...)` with current data
   - Compare prediction.topScores[0].score to actual `${homeScore}-${awayScore}`
   - Compare prediction outcome (max of homeWin/draw/awayWin) to actual outcome
3. Compute totals:
   - `total` - count of ended matches
   - `outcomeCorrect` - matches where predicted outcome direction matches actual
   - `scoreCorrect` - matches where predicted top score equals actual score
4. Cache to KV: `accuracy:stats` → `{ total, outcomeCorrect, scoreCorrect, updatedAt }`

**Approximation note**: We use current data (which may include results that influenced our records) to generate predictions for already-ended matches. This isn't a true pre-match prediction but provides reasonable accuracy estimation. A future enhancement could store pre-match prediction snapshots.

### New API Endpoint

**`GET /api/accuracy-stats`**

Response:
```json
{
  "total": 12,
  "outcomeCorrect": 9,
  "scoreCorrect": 2,
  "outcomeAccuracy": 0.75,
  "scoreAccuracy": 0.17,
  "updatedAt": "2026-06-12T08:30:00Z"
}
```

### New Component

**`app/components/AccuracyStats.vue`**

Layout:
```
┌─────────────────────────────────┐
│  📊 预测战绩                     │
│  已结束 12 场                     │
├─────────────────────────────────┤
│  胜平负预测                      │
│  ████████░░  75% (9/12)         │
├─────────────────────────────────┤
│  比分完全准确                    │
│  ██░░░░░░░░  17% (2/12)         │
└─────────────────────────────────┘
```

### Homepage Integration

Modify `app/pages/index.vue` to display TopChampionWidget and AccuracyStats side by side on desktop, stacked on mobile:

```vue
<div class="grid gap-4 md:grid-cols-2">
  <TopChampionWidget />
  <AccuracyStats />
</div>
```

## File Structure

**New files:**
- `app/components/MatchResult.vue` - Actual score + accuracy badges
- `app/components/AccuracyStats.vue` - Homepage statistics widget
- `server/api/accuracy-stats.get.ts` - Stats API endpoint
- `app/utils/poissonPrediction.ts` - Poisson distribution helpers (split from predictAlgorithm.ts)

**Modified files:**
- `app/utils/predictAlgorithm.ts` - Use Poisson model, return TOP 3 scores
- `app/types/index.ts` - Update Prediction type with topScores
- `app/components/PredictedScore.vue` - Display TOP 3 with probabilities
- `app/pages/matches/[id].vue` - Show MatchResult for ended matches
- `app/pages/index.vue` - Add AccuracyStats next to TopChampionWidget
- `server/utils/syncEngine.ts` - Calculate and cache accuracy stats
- `server/utils/kvClient.ts` - Add getAccuracyStats / setAccuracyStats functions
- `tests/predictAlgorithm.test.ts` - Update tests for new algorithm

## Error Handling

**Score prediction**:
- Lambda values clamped to [0.1, 5] to prevent extreme cases
- Goal range capped at 0-5 (covers 99% of matches)
- TOP 3 probabilities shown raw (not normalized) so users see real likelihoods

**Ended match details**:
- Match ended but no result data → show "结果加载中"
- Live match → display "比赛进行中" with current score if available
- Missing prediction data → hide comparison module, show only result

**Accuracy stats**:
- No ended matches → show "暂无数据，等待比赛结束"
- KV cache miss → fallback to real-time calculation (slower but works)
- Match without team data → skip from accuracy calculation

## Testing Strategy

### Algorithm tests (`tests/predictAlgorithm.test.ts`)

**Update existing tests**:
- Verify topScores has length 3
- Verify probabilities are in 0-1 range
- Verify outcome probabilities sum to ~100%

**New tests**:
- Test Poisson function returns correct values for known inputs
- Test that strong vs weak team produces clearly skewed probabilities
- Test that two equal teams produce balanced probabilities and likely a draw
- Test that scores like 2-1, 1-0, 1-1 appear frequently in TOP 3 (not always 3-2)

### Manual testing

- Open multiple match detail pages, verify diverse predictions
- Open ended match, verify actual result displays correctly
- Verify accuracy stats appear on homepage and update after sync
- Test with no ended matches (empty state)

## Design Decisions

### Why Poisson over current sigmoid approach?

Poisson is the textbook model for football scores. The current sigmoid model produces probabilities but disconnects them from actual scoreline likelihoods. Poisson naturally generates both outcome probabilities AND likely scores from the same model.

### Why show TOP 3 instead of just one score?

A single score implies false precision. Real predictions are distributions - showing TOP 3 with probabilities communicates uncertainty honestly. Users can see when the model is confident (one score >> others) vs uncertain (similar probabilities).

### Why raw probabilities instead of normalized?

Raw Poisson probabilities (e.g., 12.5%, 8.3%, 6.1%) accurately represent how likely each score is. Normalizing TOP 3 to sum to 100% would mislead users into thinking those are the only outcomes. Real probability gives transparency.

### Why approximate accuracy with current data?

Storing pre-match snapshots adds significant complexity (capture before match, version-control predictions). Using current records as approximation is acceptable because team records update slowly relative to match frequency, and the goal is showing trend not perfect accuracy. Future enhancement could store snapshots if needed.

### Why side-by-side layout for homepage stats?

Desktop has horizontal space; AccuracyStats next to TopChampionWidget creates a balanced "at-a-glance" header. Mobile stacks them vertically (md: breakpoint) for natural reading flow.
