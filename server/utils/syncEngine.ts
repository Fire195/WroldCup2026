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
  return new Set<string>(Object.keys(teamsJson))
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
