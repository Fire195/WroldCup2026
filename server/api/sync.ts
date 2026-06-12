import { defineEventHandler, getHeader, getMethod, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { runSync } from '~~/server/utils/syncEngine'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  if (method !== 'GET' && method !== 'POST') {
    throw createError({ statusCode: 405 })
  }
  // Authentication: Allow both authenticated cron jobs and unauthenticated frontend calls.
  // Tradeoff: This endpoint is publicly callable without auth. Acceptable because:
  // - Data sync is idempotent and rate-limited by external API quotas
  // - Frontend cannot safely store CRON_SECRET (would expose it in browser)
  // - Abuse is limited by Football Data API rate limits, not app-level auth
  const cronAuth = getHeader(event, 'authorization')
  const isManualTrigger = !cronAuth
  const isCronJob = cronAuth === `Bearer ${process.env.CRON_SECRET}`
  if (process.env.CRON_SECRET && !isManualTrigger && !isCronJob) {
    throw createError({ statusCode: 401 })
  }
  const token = useRuntimeConfig().footballDataApiKey
  if (!token) throw createError({ statusCode: 500, statusMessage: 'API key not configured' })
  return await runSync(token)
})
