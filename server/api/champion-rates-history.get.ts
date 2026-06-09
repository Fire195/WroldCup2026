import { defineEventHandler } from 'h3'
import { getChampionRatesHistory } from '~~/server/utils/kvClient'

export default defineEventHandler(async () => {
  // Return last 30 days of history (covers full tournament)
  const endDate = new Date().toISOString().slice(0, 10)
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const history = await getChampionRatesHistory(startDate, endDate)

  return history
})
