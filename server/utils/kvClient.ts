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

export async function setChampionRatesHistory(date: string, rates: Record<string, number>): Promise<void> {
  if (!kvAvailable()) return
  await kv.set(`champion_rates_history:${date}`, rates)
}

export async function getChampionRatesHistory(startDate: string, endDate: string): Promise<Record<string, Record<string, number>>> {
  if (!kvAvailable()) return {}
  const history: Record<string, Record<string, number>> = {}

  // Generate date range
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dates: string[] = []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10))
  }

  // Fetch all snapshots
  for (const date of dates) {
    const snapshot = await kv.get<Record<string, number>>(`champion_rates_history:${date}`)
    if (snapshot) {
      history[date] = snapshot
    }
  }

  return history
}
