import { defineEventHandler, getHeader, getMethod, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { runSync } from '~~/server/utils/syncEngine'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  if (method !== 'GET' && method !== 'POST') {
    throw createError({ statusCode: 405 })
  }
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
