import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchWorldCupMatches } from '~~/server/utils/footballDataClient'

beforeEach(() => { vi.restoreAllMocks() })

describe('fetchWorldCupMatches', () => {
  it('calls Football-Data.org with X-Auth-Token header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ matches: [] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await fetchWorldCupMatches('test-token')
    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toContain('competitions/WC/matches')
    expect((options as RequestInit).headers).toMatchObject({ 'X-Auth-Token': 'test-token' })
  })

  it('returns parsed match list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        matches: [
          { id: 1, homeTeam: { tla: 'BRA' }, awayTeam: { tla: 'JAM' },
            status: 'FINISHED', score: { fullTime: { home: 3, away: 0 } },
            utcDate: '2026-06-15T20:00:00Z' },
        ],
      }),
    }))

    const matches = await fetchWorldCupMatches('token')
    expect(matches).toHaveLength(1)
    expect(matches[0]).toMatchObject({
      homeTla: 'BRA', awayTla: 'JAM', status: 'FINISHED',
      homeScore: 3, awayScore: 0,
    })
  })

  it('throws on 429 rate limit', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }))
    await expect(fetchWorldCupMatches('token')).rejects.toThrow(/rate limit|429/i)
  })

  it('throws on other HTTP errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    await expect(fetchWorldCupMatches('token')).rejects.toThrow()
  })
})
