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
