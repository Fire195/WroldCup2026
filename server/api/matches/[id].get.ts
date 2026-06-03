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
