import { defineEventHandler } from 'h3'
import schedule from '~~/app/data/schedule.json'
import { getMatchResult, getChampionRates } from '~~/server/utils/kvClient'
import type { Match, MatchStage } from '~/types'

const STAGES: MatchStage[] = ['r32', 'r16', 'qf', 'sf', 'final', 'third']

export default defineEventHandler(async () => {
  const bracket: Record<MatchStage, Match[]> = {
    group: [], r32: [], r16: [], qf: [], sf: [], final: [], third: [],
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
