import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => { setActivePinia(createPinia()) })

vi.stubGlobal('$fetch', vi.fn(async (url: string) => {
  if (url === '/api/teams') return [{ id: 'BRA', name: '巴西', championRate: 18.5 }]
  if (url === '/api/matches') return [{ id: 'M001', status: 'pending' }]
  return []
}))

describe('teamStore', () => {
  it('hydrates teams from /api/teams', async () => {
    const { useTeamStore } = await import('~/stores/teamStore')
    const s = useTeamStore()
    await s.hydrate()
    expect(s.teams).toHaveLength(1)
    expect(s.byId('BRA')?.championRate).toBe(18.5)
  })
})

describe('matchStore', () => {
  it('hydrates matches from /api/matches', async () => {
    const { useMatchStore } = await import('~/stores/matchStore')
    const s = useMatchStore()
    await s.hydrate()
    expect(s.matches).toHaveLength(1)
    expect(s.byId('M001')?.status).toBe('pending')
  })
})

describe('uiStore', () => {
  it('toggles theme', async () => {
    const { useUiStore } = await import('~/stores/uiStore')
    const s = useUiStore()
    expect(s.theme).toBe('light')
    s.toggleTheme()
    expect(s.theme).toBe('dark')
  })
})
