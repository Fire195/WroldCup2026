import { describe, it, expect } from 'vitest'
import { poisson, scoreMatrix, topScores } from '~/utils/poissonPrediction'

describe('poisson', () => {
  it('returns e^-lambda for k=0', () => {
    expect(poisson(0, 1)).toBeCloseTo(Math.exp(-1), 5)
  })

  it('returns lambda * e^-lambda for k=1', () => {
    expect(poisson(1, 1)).toBeCloseTo(Math.exp(-1), 5)
    expect(poisson(1, 2)).toBeCloseTo(2 * Math.exp(-2), 5)
  })

  it('produces valid probability distribution that sums to ~1', () => {
    let sum = 0
    for (let k = 0; k <= 20; k++) sum += poisson(k, 1.5)
    expect(sum).toBeCloseTo(1, 3)
  })
})

describe('scoreMatrix', () => {
  it('returns 36 cells (6x6 grid for 0-5 goals)', () => {
    const m = scoreMatrix(1.5, 1.2)
    expect(m.length).toBe(36)
  })

  it('cells contain home, away, probability fields', () => {
    const m = scoreMatrix(1.5, 1.2)
    expect(m[0]).toEqual({
      home: 0,
      away: 0,
      probability: expect.any(Number),
    })
  })

  it('all probabilities are non-negative', () => {
    const m = scoreMatrix(1.5, 1.2)
    for (const cell of m) {
      expect(cell.probability).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('topScores', () => {
  it('returns 3 entries sorted by probability descending', () => {
    const top = topScores(2.0, 0.8)
    expect(top.length).toBe(3)
    expect(top[0].probability).toBeGreaterThanOrEqual(top[1].probability)
    expect(top[1].probability).toBeGreaterThanOrEqual(top[2].probability)
  })

  it('formats score as "h-a" string', () => {
    const top = topScores(1.5, 1.0)
    for (const s of top) {
      expect(s.score).toMatch(/^\d-\d$/)
    }
  })

  it('produces different top scores for asymmetric strengths', () => {
    const strong = topScores(2.5, 0.5)
    expect(strong[0].score).not.toBe('0-0')
    const homeGoals = parseInt(strong[0].score.split('-')[0])
    const awayGoals = parseInt(strong[0].score.split('-')[1])
    expect(homeGoals).toBeGreaterThan(awayGoals)
  })
})
