import { describe, it, expect, vi, beforeEach } from 'vitest'

const store = new Map<string, any>()
vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(async (k: string) => store.get(k) ?? null),
    set: vi.fn(async (k: string, v: any) => { store.set(k, v) }),
    del: vi.fn(async (k: string) => { store.delete(k) }),
  },
}))

beforeEach(() => { store.clear() })

import { setMatchResult, getMatchResult, setChampionRates, getChampionRates } from '~~/server/utils/kvClient'

describe('kvClient', () => {
  it('round-trips a match result', async () => {
    await setMatchResult('M001', { status: 'ended', homeScore: 2, awayScore: 1, endedAt: '2026-06-11T22:00Z' })
    const r = await getMatchResult('M001')
    expect(r).toEqual({ status: 'ended', homeScore: 2, awayScore: 1, endedAt: '2026-06-11T22:00Z' })
  })

  it('returns null for missing match', async () => {
    expect(await getMatchResult('NOPE')).toBeNull()
  })

  it('round-trips champion rates', async () => {
    await setChampionRates({ BRA: 18.5, ARG: 17.2 })
    const r = await getChampionRates()
    expect(r).toEqual({ BRA: 18.5, ARG: 17.2 })
  })

  it('returns empty object when no champion rates set', async () => {
    expect(await getChampionRates()).toEqual({})
  })
})
