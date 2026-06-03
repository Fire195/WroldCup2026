import { defineStore } from 'pinia'
import type { Team } from '~/types'

interface TeamWithRate extends Team { championRate: number }

export const useTeamStore = defineStore('team', {
  state: () => ({ teams: [] as TeamWithRate[], loaded: false }),
  getters: {
    byId: (state) => (id: string) => state.teams.find(t => t.id === id),
    byGroup: (state) => (g: string) => state.teams.filter(t => t.group === g),
    top5: (state) => [...state.teams].sort((a, b) => b.championRate - a.championRate).slice(0, 5),
  },
  actions: {
    async hydrate(force = false) {
      if (this.loaded && !force) return
      this.teams = await $fetch<TeamWithRate[]>('/api/teams')
      this.loaded = true
    },
  },
})
