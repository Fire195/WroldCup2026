import type { Match, GroupStanding } from '~/types'

export function calcGroupStandings(teamIds: string[], matches: Match[]): GroupStanding[] {
  const table: Record<string, GroupStanding> = {}
  for (const id of teamIds) {
    table[id] = {
      teamId: id,
      played: 0,
      win: 0,
      draw: 0,
      lose: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    }
  }

  for (const match of matches) {
    if (match.status !== 'ended' || !match.result) continue
    const home = table[match.homeTeamId]
    const away = table[match.awayTeamId]
    if (!home || !away) continue

    const { homeScore, awayScore } = match.result
    home.played++
    away.played++
    home.goalsFor += homeScore
    home.goalsAgainst += awayScore
    away.goalsFor += awayScore
    away.goalsAgainst += homeScore

    if (homeScore > awayScore) {
      home.win++
      home.points += 3
      away.lose++
    }
    else if (homeScore < awayScore) {
      away.win++
      away.points += 3
      home.lose++
    }
    else {
      home.draw++
      away.draw++
      home.points++
      away.points++
    }
  }

  for (const row of Object.values(table)) {
    row.goalDiff = row.goalsFor - row.goalsAgainst
  }

  return Object.values(table).sort((a, b) =>
    b.points - a.points
    || b.goalDiff - a.goalDiff
    || b.goalsFor - a.goalsFor
    || a.teamId.localeCompare(b.teamId),
  )
}
