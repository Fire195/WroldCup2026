import { describe, it, expect } from 'vitest'
import { calcChampionRates } from '~/utils/probabilityCalc'
import type { Team } from '~/types'

const team = (id: string, rank: number, avgPts: number): Team => ({
  id, name: id, nameEn: id, logo: '', flag: '', group: 'A',
  fifaRank: rank, fifaPoint: 2000 - rank * 5,
  style: '', strength: [], weakness: [],
  recentRecord: {
    matches: 14, win: 8, draw: 3, lose: 3,
    goalsFor: 25, goalsAgainst: 10,
    avgGoals: 1.78, avgConceded: 0.71, avgPoints: avgPts,
  },
})

describe('calcChampionRates', () => {
  it('returns rates that sum to ~100% for active teams', () => {
    const teams = [team('BRA',1,2.25), team('ARG',2,2.44), team('FRA',3,2.40), team('ENG',4,2.27)]
    const rates = calcChampionRates(teams, new Set(teams.map(t => t.id)))
    const total = Object.values(rates).reduce((s,v)=>s+v,0)
    expect(total).toBeCloseTo(100, 0)
  })

  it('eliminated teams get 0%', () => {
    const teams = [team('BRA',1,2.25), team('ARG',2,2.44), team('JAM',60,1.0)]
    const rates = calcChampionRates(teams, new Set(['BRA','ARG']))
    expect(rates['JAM']).toBe(0)
    expect(rates['BRA'] + rates['ARG']).toBeCloseTo(100, 0)
  })

  it('higher-ranked, better-form team gets higher rate', () => {
    const strong = team('ARG', 2, 2.44)
    const weak = team('JAM', 60, 1.00)
    const rates = calcChampionRates([strong, weak], new Set(['ARG','JAM']))
    expect(rates['ARG']).toBeGreaterThan(rates['JAM'])
  })

  it('handles last team alive at 100%', () => {
    const teams = [team('BRA',1,2.25), team('JAM',60,1.0)]
    const rates = calcChampionRates(teams, new Set(['BRA']))
    expect(rates['BRA']).toBeCloseTo(100, 0)
    expect(rates['JAM']).toBe(0)
  })
})
