import { kv } from '@vercel/kv'

export interface CachedMatchResult {
  status: 'pending' | 'live' | 'ended'
  homeScore: number | null
  awayScore: number | null
  endedAt?: string
}

function kvAvailable(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

export async function setMatchResult(matchId: string, r: CachedMatchResult): Promise<void> {
  if (!kvAvailable()) return
  await kv.set(`match:${matchId}`, r)
}

export async function getMatchResult(matchId: string): Promise<CachedMatchResult | null> {
  if (!kvAvailable()) return null
  return (await kv.get<CachedMatchResult>(`match:${matchId}`)) ?? null
}

export async function getAllMatchResults(matchIds: string[]): Promise<Record<string, CachedMatchResult>> {
  const out: Record<string, CachedMatchResult> = {}
  if (!kvAvailable()) return out
  for (const id of matchIds) {
    const v = await getMatchResult(id)
    if (v) out[id] = v
  }
  return out
}

export async function setChampionRates(rates: Record<string, number>): Promise<void> {
  if (!kvAvailable()) return
  await kv.set('champion_rates', rates)
}

export async function getChampionRates(): Promise<Record<string, number>> {
  if (!kvAvailable()) return {}
  return (await kv.get<Record<string, number>>('champion_rates')) ?? {}
}
