import { describe, it, expect, vi } from 'vitest'

vi.mock('~~/server/utils/kvClient', () => ({
  getMatchResult: vi.fn(async () => null),
  getChampionRates: vi.fn(async () => ({ BRA: 18.5, ARG: 17.2 })),
}))

const handler = (await import('~~/server/api/knockout.get')).default

describe('GET /api/knockout', () => {
  it('returns bracket grouped by stage and champion rates', async () => {
    const result = await handler({} as any)
    expect(result.bracket).toBeDefined()
    expect(result.bracket.r32).toHaveLength(16)
    expect(result.bracket.r16).toHaveLength(8)
    expect(result.bracket.qf).toHaveLength(4)
    expect(result.bracket.sf).toHaveLength(2)
    expect(result.bracket.final).toHaveLength(1)
    expect(result.bracket.third).toHaveLength(1)
    expect(result.championRates['BRA']).toBe(18.5)
  })
})
