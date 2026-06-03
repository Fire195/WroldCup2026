import { describe, it, expect, vi } from 'vitest'

vi.mock('~~/server/utils/kvClient', () => ({
  getMatchResult: vi.fn(async () => null),
  getChampionRates: vi.fn(async () => ({})),
}))

const handler = (await import('~~/server/api/groups/[group].get')).default

describe('GET /api/groups/[group]', () => {
  it('returns standings, fixtures, and team list for group A', async () => {
    const event = { context: { params: { group: 'A' } } } as any
    const result = await handler(event)
    expect(result.group).toBe('A')
    expect(result.teams).toHaveLength(4)
    expect(result.standings).toHaveLength(4)
    expect(result.fixtures.length).toBeGreaterThan(0)
    expect(result.fixtures.every((m: any) => m.group === 'A')).toBe(true)
  })

  it('throws 404 for invalid group', async () => {
    const event = { context: { params: { group: 'Z' } } } as any
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 404 })
  })
})
