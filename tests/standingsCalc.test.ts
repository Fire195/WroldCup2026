import { describe, it, expect } from 'vitest'
import { calcGroupStandings } from '~/utils/standingsCalc'
import type { Match } from '~/types'

const m = (h: string, a: string, hs: number, as_: number, status: 'ended' | 'pending' = 'ended'): Match => ({
  id: `${h}-${a}`,
  homeTeamId: h,
  awayTeamId: a,
  group: 'A',
  stage: 'group',
  matchTime: '2026-06-11T00:00:00Z',
  venue: 'X',
  status,
  result: status === 'ended' ? { homeScore: hs, awayScore: as_, endedAt: '2026-06-11T02:00:00Z' } : undefined,
})

describe('calcGroupStandings', () => {
  it('returns zeroed rows for all teams when no matches played', () => {
    const r = calcGroupStandings(['BRA', 'AUS', 'SCO', 'JAM'], [])
    expect(r).toHaveLength(4)
    expect(r.every(s => s.played === 0 && s.points === 0)).toBe(true)
  })

  it('counts a win for home team correctly', () => {
    const r = calcGroupStandings(['BRA', 'AUS'], [m('BRA', 'AUS', 2, 0)])
    const bra = r.find(x => x.teamId === 'BRA')!
    expect(bra.win).toBe(1)
    expect(bra.points).toBe(3)
    expect(bra.goalsFor).toBe(2)
    expect(bra.goalsAgainst).toBe(0)
    expect(bra.goalDiff).toBe(2)
  })

  it('handles a draw', () => {
    const r = calcGroupStandings(['BRA', 'AUS'], [m('BRA', 'AUS', 1, 1)])
    expect(r.find(x => x.teamId === 'BRA')!.points).toBe(1)
    expect(r.find(x => x.teamId === 'AUS')!.points).toBe(1)
  })

  it('ignores pending matches', () => {
    const r = calcGroupStandings(['BRA', 'AUS'], [m('BRA', 'AUS', 2, 0, 'pending')])
    expect(r.every(s => s.played === 0)).toBe(true)
  })

  it('sorts by points then goalDiff then goalsFor', () => {
    const matches = [
      m('BRA', 'JAM', 3, 0),
      m('AUS', 'SCO', 1, 1),
      m('BRA', 'AUS', 2, 1),
      m('SCO', 'JAM', 2, 0),
    ]
    const r = calcGroupStandings(['BRA', 'AUS', 'SCO', 'JAM'], matches)
    expect(r[0].teamId).toBe('BRA')
    expect(r[3].teamId).toBe('JAM')
  })
})
