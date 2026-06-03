import { describe, it, expect } from 'vitest'
import type { Team, Match, Prediction } from '~/types'

describe('shared types', () => {
  it('Team interface accepts a valid object', () => {
    const t: Team = {
      id: 'BRA', name: '巴西', nameEn: 'Brazil',
      logo: '/logos/BRA.png', flag: '/flags/BRA.png',
      group: 'A', fifaRank: 1, fifaPoint: 1860,
      style: '技术流', strength: ['进攻'], weakness: ['防守'],
      recentRecord: { matches: 16, win: 11, draw: 3, lose: 2,
        goalsFor: 32, goalsAgainst: 9,
        avgGoals: 2.0, avgConceded: 0.56, avgPoints: 2.25 },
    }
    expect(t.id).toBe('BRA')
  })
})
