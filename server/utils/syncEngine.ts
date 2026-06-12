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
  let top1Correct = 0
  let top2Correct = 0
  let top3Correct = 0
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
    const actualScore = `${actualHome}-${actualAway}`
    const actualOutcome = actualHome > actualAway ? 'home' : actualHome < actualAway ? 'away' : 'draw'
    const max = Math.max(prediction.homeWin, prediction.draw, prediction.awayWin)
    const predictedOutcome = prediction.homeWin === max ? 'home' : prediction.awayWin === max ? 'away' : 'draw'

    if (actualOutcome === predictedOutcome) outcomeCorrect++
    if (prediction.topScores[0]?.score === actualScore) top1Correct++
    if (prediction.topScores[1]?.score === actualScore) top2Correct++
    if (prediction.topScores[2]?.score === actualScore) top3Correct++
  }

  await setAccuracyStats({
    total: endedMatches.length,
    outcomeCorrect,
    top1Correct,
    top2Correct,
    top3Correct,
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
