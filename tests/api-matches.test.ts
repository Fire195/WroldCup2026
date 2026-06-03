import { describe, it, expect, vi } from 'vitest'

vi.mock('~~/server/utils/kvClient', () => ({
  getMatchResult: vi.fn(async (id: string) =>
    id === 'M001'
      ? { status: 'ended', homeScore: 2, awayScore: 0, endedAt: '2026-06-11T22:00Z' }
      : null
  ),
  getChampionRates: vi.fn(async () => ({})),
}))

const list = (await import('~~/server/api/matches.get')).default
const single = (await import('~~/server/api/matches/[id].get')).default

describe('matches API', () => {
  it('GET /api/matches returns 104 matches with KV overlay', async () => {
    const result = await list({} as any)
    expect(result).toHaveLength(104)
    const m1 = result.find((m: any) => m.id === 'M001')!
    expect(m1.status).toBe('ended')
    expect(m1.result).toMatchObject({ homeScore: 2, awayScore: 0 })
  })

  it('GET /api/matches/M001 returns single match with prediction', async () => {
    const event = { context: { params: { id: 'M001' } } } as any
    const m = await single(event)
    expect(m.id).toBe('M001')
    expect(m.prediction).toBeDefined()
    expect(m.prediction.homeWin + m.prediction.draw + m.prediction.awayWin).toBeCloseTo(100, 0)
  })

  it('GET /api/matches/UNKNOWN throws 404', async () => {
    const event = { context: { params: { id: 'NOPE' } } } as any
    await expect(single(event)).rejects.toMatchObject({ statusCode: 404 })
  })
})
