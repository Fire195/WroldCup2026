import { describe, it, expect, vi } from 'vitest'

vi.mock('~~/server/utils/kvClient', () => ({
  getChampionRates: vi.fn(async () => ({ BRA: 18.5, ARG: 17.2 })),
}))

const handler = (await import('~~/server/api/teams.get')).default

describe('GET /api/teams', () => {
  it('returns 48 teams merged with champion rates', async () => {
    const event = {} as any
    const result = await handler(event)
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(48)
    const bra = result.find((t: any) => t.id === 'BRA')!
    expect(bra.championRate).toBe(18.5)
    expect(bra.recentRecord).toBeDefined()
    const bih = result.find((t: any) => t.id === 'BIH')!
    expect(bih.championRate).toBe(0)
  })
})
