import { defineEventHandler } from 'h3'
import teams from '~~/app/data/teams.json'
import records from '~~/app/data/recentRecords.json'
import { getChampionRates } from '~~/server/utils/kvClient'

export default defineEventHandler(async () => {
  const rates = await getChampionRates()
  return Object.values(teams).map((t: any) => ({
    ...t,
    recentRecord: (records as Record<string, any>)[t.id],
    championRate: rates[t.id] ?? 0,
  }))
})
