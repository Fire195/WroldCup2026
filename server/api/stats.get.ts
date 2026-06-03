import { defineEventHandler, useRuntimeConfig, createError } from 'h3'
import { kv } from '@vercel/kv'

interface Scorer { rank: number; player: { name: string; nationality: string }; team: { tla: string }; goals: number }
interface StatsCache { scorers: Scorer[]; updatedAt: string }

const STATS_KEY = 'stats:scorers'
const STALE_MINUTES = 30

export default defineEventHandler(async () => {
  const cached = await kv.get<StatsCache>(STATS_KEY)
  const fresh = cached && (Date.now() - new Date(cached.updatedAt).getTime()) < STALE_MINUTES * 60_000
  if (fresh) return cached

  const config = useRuntimeConfig()
  const token = config.footballDataApiKey
  if (!token) throw createError({ statusCode: 500, statusMessage: 'API key not configured' })

  const res = await fetch('https://api.football-data.org/v4/competitions/WC/scorers', {
    headers: { 'X-Auth-Token': token },
  })
  if (!res.ok) {
    if (cached) return cached
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch scorers' })
  }
  const data = await res.json() as { scorers: any[] }
  const scorers: Scorer[] = data.scorers.slice(0, 30).map((s, i) => ({
    rank: i + 1,
    player: { name: s.player?.name ?? 'Unknown', nationality: s.player?.nationality ?? '' },
    team: { tla: s.team?.tla ?? '' },
    goals: s.goals ?? s.numberOfGoals ?? 0,
  }))
  const result: StatsCache = { scorers, updatedAt: new Date().toISOString() }
  await kv.set(STATS_KEY, result)
  return result
})
