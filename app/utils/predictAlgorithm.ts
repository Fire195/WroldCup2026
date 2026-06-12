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
