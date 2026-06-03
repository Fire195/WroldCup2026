import { describe, it, expect } from 'vitest'
import groups from '~~/app/data/groups.json'
import teams from '~~/app/data/teams.json'
import records from '~~/app/data/recentRecords.json'
import players from '~~/app/data/players.json'
import schedule from '~~/app/data/schedule.json'

describe('static data integrity', () => {
  it('groups has 12 keys A-L and 4 teams each', () => {
    const keys = Object.keys(groups)
    expect(keys).toHaveLength(12)
    for (const k of keys) {
      expect(groups[k as keyof typeof groups]).toHaveLength(4)
    }
  })

  it('teams.json has all 48 unique team IDs', () => {
    const ids = Object.keys(teams)
    expect(ids).toHaveLength(48)
    expect(new Set(ids).size).toBe(48)
  })

  it('every team in groups appears in teams.json', () => {
    const groupTeams = Object.values(groups).flat()
    for (const id of groupTeams) {
      expect(teams).toHaveProperty(id)
    }
  })

  it('every team has a recentRecord entry', () => {
    for (const id of Object.keys(teams)) {
      expect(records).toHaveProperty(id)
    }
  })

  it('every team has a players entry with 26 squad members', () => {
    for (const id of Object.keys(teams)) {
      expect(players).toHaveProperty(id)
      expect((players as any)[id]).toHaveLength(26)
    }
  })

  it('schedule has 104 matches with valid stages', () => {
    expect(schedule).toHaveLength(104)
    const validStages = ['group', 'r32', 'r16', 'qf', 'sf', 'final', 'third']
    for (const m of schedule as any[]) {
      expect(validStages).toContain(m.stage)
    }
  })

  it('group-stage matches reference valid teams in correct group', () => {
    for (const m of (schedule as any[]).filter((x) => x.stage === 'group')) {
      const g = groups[m.group as keyof typeof groups]
      expect(g).toContain(m.homeTeamId)
      expect(g).toContain(m.awayTeamId)
    }
  })

  it('schedule has the right knockout match counts', () => {
    const counts = (schedule as any[]).reduce<Record<string, number>>((acc, m) => {
      acc[m.stage] = (acc[m.stage] ?? 0) + 1
      return acc
    }, {})
    expect(counts.group).toBe(72)
    expect(counts.r32).toBe(16)
    expect(counts.r16).toBe(8)
    expect(counts.qf).toBe(4)
    expect(counts.sf).toBe(2)
    expect(counts.third).toBe(1)
    expect(counts.final).toBe(1)
  })
})
