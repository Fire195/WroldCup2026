import { defineEventHandler } from 'h3'
import schedule from '~~/app/data/schedule.json'
import { getMatchResult } from '~~/server/utils/kvClient'

export default defineEventHandler(async () => {
  const out = []
  for (const m of schedule as any[]) {
    const cached = await getMatchResult(m.id)
    if (cached) {
      out.push({
        ...m,
        status: cached.status,
        result: cached.status === 'ended'
          ? { homeScore: cached.homeScore, awayScore: cached.awayScore, endedAt: cached.endedAt }
          : undefined,
      })
    } else {
      out.push(m)
    }
  }
  return out
})
