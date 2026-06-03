import { defineEventHandler, getRouterParam, createError } from 'h3'
import players from '~~/app/data/players.json'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const squad = (players as any)[id]
  if (!squad) throw createError({ statusCode: 404 })
  return squad
})
