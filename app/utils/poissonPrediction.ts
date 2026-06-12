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
