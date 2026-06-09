<script setup lang="ts">
import type { GroupStanding } from '~/types'
import { useTeamStore } from '~/stores/teamStore'
const props = defineProps<{ standings: GroupStanding[] }>()
const teams = useTeamStore()

const remainingMatchesPerTeam = 3
const chance = computed(() => {
  return props.standings.map(s => {
    const maxPossible = s.points + (remainingMatchesPerTeam - s.played) * 3
    const minPossible = s.points
    const ratio = (maxPossible - 4) / 6
    const pct = Math.max(0, Math.min(100, ratio * 100))
    return { teamId: s.teamId, pct, locked: minPossible >= 7 }
  })
})
</script>
<template>
  <div class="space-y-2">
    <div v-for="c in chance" :key="c.teamId" class="text-sm">
      <div class="flex justify-between mb-1">
        <span class="dark:text-gray-100">{{ teams.byId(c.teamId)?.name ?? c.teamId }}</span>
        <span class="tabular-nums dark:text-gray-100">{{ c.locked ? '已晋级' : `${c.pct.toFixed(0)}%` }}</span>
      </div>
      <div class="h-2 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <div class="h-full bg-brand" :style="{ width: c.pct + '%' }" />
      </div>
    </div>
  </div>
</template>
