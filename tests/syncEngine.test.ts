import { describe, it, expect, vi, beforeEach } from 'vitest'

const kvStore = new Map<string, any>()
vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(async (k: string) => kvStore.get(k) ?? null),
    set: vi.fn(async (k: string, v: any) => { kvStore.set(k, v) }),
    del: vi.fn(async (k: string) => { kvStore.delete(k) }),
  },
}))
vi.mock('~~/server/utils/footballDataClient', () => ({
  fetchWorldCupMatches: vi.fn(),
}))

beforeEach(() => kvStore.clear())

const { runSync } = await import('~~/server/utils/syncEngine')
const { fetchWorldCupMatches } = await import('~~/server/utils/footballDataClient')

describe('runSync', () => {
  it('writes finished matches to KV with mapped TLAs', async () => {
    vi.mocked(fetchWorldCupMatches).mockResolvedValue([
      { externalId: 1, homeTla: 'BRA', awayTla: 'AUS', status: 'FINISHED',
        homeScore: 3, awayScore: 0, utcDate: '2026-06-11T16:00:00Z' },
    ])
    const result = await runSync('test-token')
    expect(result.updated).toBe(1)
    expect(kvStore.size).toBeGreaterThan(0)
  })

  it('skips matches not yet finished', async () => {
    vi.mocked(fetchWorldCupMatches).mockResolvedValue([
      { externalId: 1, homeTla: 'BRA', awayTla: 'AUS', status: 'SCHEDULED',
        homeScore: null, awayScore: null, utcDate: '2026-06-11T16:00:00Z' },
    ])
    const result = await runSync('test-token')
    expect(result.updated).toBe(0)
  })

  it('updates champion_rates after sync', async () => {
    vi.mocked(fetchWorldCupMatches).mockResolvedValue([])
    await runSync('test-token')
    expect(kvStore.has('champion_rates')).toBe(true)
  })

  it('returns error result on API failure', async () => {
    vi.mocked(fetchWorldCupMatches).mockRejectedValue(new Error('429'))
    const result = await runSync('test-token')
    expect(result.error).toMatch(/429/)
    expect(result.updated).toBe(0)
  })
})
