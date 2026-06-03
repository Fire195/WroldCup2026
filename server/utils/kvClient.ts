import { kv } from '@vercel/kv'

export interface CachedMatchResult {
  status: 'pending' | 'live' | 'ended'
  homeScore: number | null
  awayScore: number | null
  endedAt?: string
}

export async function setMatchResult(matchId: string, r: CachedMatchResult): Promise<void> {
  await kv.set(`match:${matchId}`, r)
}

export async function getMatchResult(matchId: string): Promise<CachedMatchResult | null> {
  return (await kv.get<CachedMatchResult>(`match:${matchId}`)) ?? null
}

export async function getAllMatchResults(matchIds: string[]): Promise<Record<string, CachedMatchResult>> {
  const out: Record<string, CachedMatchResult> = {}
  for (const id of matchIds) {
    const v = await getMatchResult(id)
    if (v) out[id] = v
  }
  return out
}

export async function setChampionRates(rates: Record<string, number>): Promise<void> {
  await kv.set('champion_rates', rates)
}

export async function getChampionRates(): Promise<Record<string, number>> {
  return (await kv.get<Record<string, number>>('champion_rates')) ?? {}
}
