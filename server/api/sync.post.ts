import { defineEventHandler, getHeader, createError, useRuntimeConfig } from 'h3'
import { runSync } from '~~/server/utils/syncEngine'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cronAuth = getHeader(event, 'authorization')
  if (process.env.CRON_SECRET && cronAuth !== `Bearer ${process.env.CRON_SECRET}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const token = config.footballDataApiKey
  if (!token) throw createError({ statusCode: 500, statusMessage: 'API key not configured' })
  return await runSync(token)
})
