import type { Team } from '~/types'

const W = { attackDef: 0.30, form: 0.25, rank: 0.20, schedule: 0.15, exp: 0.10 } as const

const EXPERIENCE_BONUS: Record<string, number> = {
  BRA: 100, ARG: 100, GER: 95, ITA: 95, FRA: 90, ESP: 85, ENG: 85,
  NED: 80, POR: 80, URU: 80, BEL: 70, CRO: 70, MEX: 65, USA: 60,
  COL: 60, JPN: 55, KOR: 55, MAR: 55, SUI: 60, DEN: 55, POL: 55,
  NOR: 40, SEN: 50, AUS: 50, IRN: 45, EGY: 45, TUN: 45, GHA: 50,
  CIV: 50, ALG: 45, RSA: 40, ECU: 50, PAR: 50, QAT: 35, KSA: 40,
  CPV: 20, IRQ: 30, UZB: 20, JOR: 20, NZL: 35, JAM: 30, PAN: 35,
  HAI: 30, CUW: 15, TUR: 50, AUT: 50,
}

function attackDefIndex(t: Team): number {
  const r = t.recentRecord
  const ratio = r.avgGoals / Math.max(0.3, r.avgConceded)
  return Math.min(100, ratio * 30)
}

function formIndex(t: Team): number {
  return (t.recentRecord.avgPoints / 3) * 100
}

function rankIndex(t: Team): number {
  return Math.max(0, 100 - Math.log2(t.fifaRank) * 14)
}

function scheduleDifficulty(_t: Team): number {
  return 50
}

function experienceIndex(t: Team): number {
  return EXPERIENCE_BONUS[t.id] ?? 30
}

export function calcChampionRates(teams: Team[], aliveIds: Set<string>): Record<string, number> {
  const raw: Record<string, number> = {}
  for (const t of teams) {
    if (!aliveIds.has(t.id)) {
      raw[t.id] = 0
      continue
    }
    raw[t.id] =
      attackDefIndex(t) * W.attackDef
      + formIndex(t) * W.form
      + rankIndex(t) * W.rank
      + (100 - scheduleDifficulty(t)) * W.schedule
      + experienceIndex(t) * W.exp
  }
  const total = Object.values(raw).reduce((s, v) => s + v, 0)
  const out: Record<string, number> = {}
  for (const id of Object.keys(raw)) {
    const v = raw[id] ?? 0
    out[id] = total === 0 ? 0 : Math.round((v / total) * 100 * 10) / 10
  }
  return out
}
