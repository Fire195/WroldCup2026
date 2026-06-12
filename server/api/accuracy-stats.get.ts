import { defineEventHandler } from 'h3'
import schedule from '~~/app/data/schedule.json'
import teamsJson from '~~/app/data/teams.json'
import recordsJson from '~~/app/data/recentRecords.json'
import playersJson from '~~/app/data/players.json'
import groupsJson from '~~/app/data/groups.json'
import { getAccuracyStats, getMatchResult, type AccuracyStats } from '~~/server/utils/kvClient'
import { calcGroupStandings } from '~/utils/standingsCalc'
import { predictMatch } from '~/utils/predictAlgorithm'
import type { Team, Match } from '~/types'

function buildTeam(id: string): Team | null {
  const t = (teamsJson as any)[id]
  if (!t) return null
  return { ...t, recentRecord: (recordsJson as any)[id] }
}

async function liveCalculate(): Promise<AccuracyStats> {
  let total = 0, outcomeCorrect = 0, top1Correct = 0, top2Correct = 0, top3Correct = 0
  for (const m of schedule as any[]) {
    const cached = await getMatchResult(m.id)
    if (cached?.status !== 'ended' || cached.homeScore === null || cached.awayScore === null) continue

    const home = buildTeam(m.homeTeamId)
    const away = buildTeam(m.awayTeamId)
    if (!home || !away) continue
    total++

    let standings: ReturnType<typeof calcGroupStandings> = []
    if (m.group) {
      const groupTeams = (groupsJson as any)[m.group] as string[]
      const groupMatches: Match[] = []
      for (const gm of (schedule as any[]).filter(g => g.group === m.group)) {
        const c = await getMatchResult(gm.id)
        groupMatches.push(c
          ? { ...gm, status: c.status, result: c.status === 'ended'
              ? { homeScore: c.homeScore, awayScore: c.awayScore, endedAt: c.endedAt! } : undefined }
          : gm)
      }
      standings = calcGroupStandings(groupTeams, groupMatches)
    }

    const prediction = predictMatch(
      home, away, standings,
      (playersJson as any)[away.id] ?? [],
      (playersJson as any)[home.id] ?? [],
    )

    const actualScore = `${cached.homeScore}-${cached.awayScore}`
    const actualOutcome = cached.homeScore > cached.awayScore ? 'home' : cached.homeScore < cached.awayScore ? 'away' : 'draw'
    const max = Math.max(prediction.homeWin, prediction.draw, prediction.awayWin)
    const predictedOutcome = prediction.homeWin === max ? 'home' : prediction.awayWin === max ? 'away' : 'draw'

    if (actualOutcome === predictedOutcome) outcomeCorrect++
    if (prediction.topScores[0]?.score === actualScore) top1Correct++
    if (prediction.topScores[1]?.score === actualScore) top2Correct++
    if (prediction.topScores[2]?.score === actualScore) top3Correct++
  }
  return { total, outcomeCorrect, top1Correct, top2Correct, top3Correct, updatedAt: new Date().toISOString() }
}

export default defineEventHandler(async () => {
  const cached = await getAccuracyStats()
  if (cached) return cached
  return await liveCalculate()
})
