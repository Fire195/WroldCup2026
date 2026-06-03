import { defineStore } from 'pinia'
import type { Match } from '~/types'

export const useMatchStore = defineStore('match', {
  state: () => ({ matches: [] as Match[], loaded: false }),
  getters: {
    byId: (state) => (id: string) => state.matches.find(m => m.id === id),
    byGroup: (state) => (g: string) => state.matches.filter(m => m.group === g),
    byStage: (state) => (s: Match['stage']) => state.matches.filter(m => m.stage === s),
    today: (state) => {
      const today = new Date().toISOString().slice(0, 10)
      return state.matches.filter(m => m.matchTime.startsWith(today))
    },
    latestEnded: (state) => state.matches
      .filter(m => m.status === 'ended')
      .sort((a, b) => (b.result?.endedAt ?? '').localeCompare(a.result?.endedAt ?? ''))
      .slice(0, 5),
  },
  actions: {
    async hydrate(force = false) {
      if (this.loaded && !force) return
      this.matches = await $fetch<Match[]>('/api/matches')
      this.loaded = true
    },
  },
})
