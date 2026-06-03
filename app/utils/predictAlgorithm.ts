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
