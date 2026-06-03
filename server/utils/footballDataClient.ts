export interface ExternalMatch {
  externalId: number
  homeTla: string
  awayTla: string
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED'
  homeScore: number | null
  awayScore: number | null
  utcDate: string
}

const BASE_URL = 'https://api.football-data.org/v4'

export async function fetchWorldCupMatches(token: string): Promise<ExternalMatch[]> {
  const res = await fetch(`${BASE_URL}/competitions/WC/matches`, {
    headers: { 'X-Auth-Token': token },
  })
  if (!res.ok) {
    if (res.status === 429) throw new Error('Football-Data.org rate limit (429)')
    throw new Error(`Football-Data.org error: ${res.status}`)
  }
  const data = await res.json() as { matches: any[] }
  return data.matches.map(m => ({
    externalId: m.id,
    homeTla: m.homeTeam?.tla ?? '',
    awayTla: m.awayTeam?.tla ?? '',
    status: m.status,
    homeScore: m.score?.fullTime?.home ?? null,
    awayScore: m.score?.fullTime?.away ?? null,
    utcDate: m.utcDate,
  }))
}
