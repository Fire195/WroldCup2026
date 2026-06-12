import { describe, it, expect } from 'vitest'
import { predictMatch } from '~/utils/predictAlgorithm'
import type { Team, GroupStanding } from '~/types'

const team = (id: string, rank: number, recent: Partial<Team['recentRecord']>): Team => ({
  id, name: id, nameEn: id, logo: '', flag: '', group: 'A',
  fifaRank: rank, fifaPoint: 2000 - rank * 5,
  style: '', strength: [], weakness: [],
  recentRecord: {
    matches: 14, win: 7, draw: 4, lose: 3,
    goalsFor: 20, goalsAgainst: 12,
    avgGoals: 1.5, avgConceded: 0.85, avgPoints: 1.79,
    ...recent,
  },
})

describe('predictMatch', () => {
  it('returns probabilities that sum to ~100%', () => {
    const home = team('BRA', 1, { win: 11, draw: 3, lose: 2, goalsFor: 32, goalsAgainst: 9, avgGoals: 2.1, avgConceded: 0.6 })
    const away = team('JAM', 60, { win: 3, draw: 2, lose: 6, goalsFor: 10, goalsAgainst: 21, avgGoals: 0.9, avgConceded: 1.9 })
    const p = predictMatch(home, away, [], [])
    expect(p.homeWin + p.draw + p.awayWin).toBeCloseTo(100, 0)
  })

  it('favors stronger team', () => {
    const home = team('BRA', 1, { win: 11, draw: 3, lose: 2, goalsFor: 32, goalsAgainst: 9, avgGoals: 2.1, avgConceded: 0.6 })
    const away = team('JAM', 60, { win: 3, draw: 2, lose: 6, goalsFor: 10, goalsAgainst: 21, avgGoals: 0.9, avgConceded: 1.9 })
    const p = predictMatch(home, away, [], [])
    expect(p.homeWin).toBeGreaterThan(p.awayWin)
    expect(p.homeWin).toBeGreaterThan(50)
  })

  it('returns roughly even odds for similar teams', () => {
    const home = team('GER', 10, {})
    const away = team('NED', 11, {})
    const p = predictMatch(home, away, [], [])
    expect(Math.abs(p.homeWin - p.awayWin)).toBeLessThan(15)
  })

  it('returns TOP 3 scores with valid format', () => {
    const home = team('BRA', 1, {})
    const away = team('JAM', 60, {})
    const p = predictMatch(home, away, [], [])
    expect(p.topScores.length).toBe(3)
    for (const s of p.topScores) {
      expect(s.score).toMatch(/^\d+-\d+$/)
      expect(s.probability).toBeGreaterThan(0)
      expect(s.probability).toBeLessThanOrEqual(1)
    }
  })

  it('TOP 3 scores are sorted by probability descending', () => {
    const home = team('BRA', 1, {})
    const away = team('JAM', 60, {})
    const p = predictMatch(home, away, [], [])
    expect(p.topScores[0].probability).toBeGreaterThanOrEqual(p.topScores[1].probability)
    expect(p.topScores[1].probability).toBeGreaterThanOrEqual(p.topScores[2].probability)
  })

  it('bestScore equals first entry of topScores', () => {
    const home = team('BRA', 1, {})
    const away = team('JAM', 60, {})
    const p = predictMatch(home, away, [], [])
    expect(p.bestScore).toBe(p.topScores[0].score)
  })

  it('produces varied scores (not always 3-2)', () => {
    const matchups = [
      [team('A', 1, { avgGoals: 2.5, avgConceded: 0.5 }), team('B', 80, { avgGoals: 0.8, avgConceded: 2.5 })],
      [team('A', 30, { avgGoals: 1.2, avgConceded: 1.2 }), team('B', 32, { avgGoals: 1.2, avgConceded: 1.2 })],
      [team('A', 50, { avgGoals: 0.9, avgConceded: 1.5 }), team('B', 5, { avgGoals: 2.2, avgConceded: 0.7 })],
      [team('A', 15, { avgGoals: 1.5, avgConceded: 1.0 }), team('B', 18, { avgGoals: 1.4, avgConceded: 1.1 })],
    ]
    const scores = matchups.map(([h, a]) => predictMatch(h, a, [], []).bestScore)
    const unique = new Set(scores)
    expect(unique.size).toBeGreaterThan(1)
  })

  it('returns confidence in [0, 1]', () => {
    const home = team('BRA', 1, {})
    const away = team('JAM', 60, {})
    const p = predictMatch(home, away, [], [])
    expect(p.confidence).toBeGreaterThanOrEqual(0)
    expect(p.confidence).toBeLessThanOrEqual(1)
  })

  it('considers current group standings (factor 4)', () => {
    const home = team('BRA', 5, {})
    const away = team('FRA', 4, {})
    const empty: GroupStanding[] = []
    const homeLeading: GroupStanding[] = [
      { teamId: 'BRA', played: 2, win: 2, draw: 0, lose: 0, goalsFor: 5, goalsAgainst: 0, goalDiff: 5, points: 6 },
      { teamId: 'FRA', played: 2, win: 0, draw: 0, lose: 2, goalsFor: 0, goalsAgainst: 5, goalDiff: -5, points: 0 },
    ]
    const a = predictMatch(home, away, empty, [])
    const b = predictMatch(home, away, homeLeading, [])
    expect(b.homeWin).toBeGreaterThan(a.homeWin)
  })
})
