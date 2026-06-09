<script setup lang="ts">
import KnockoutTree from '~/components/KnockoutTree.vue'
import ChampionLeaderboard from '~/components/ChampionLeaderboard.vue'
import ProbabilityTrend from '~/components/ProbabilityTrend.vue'
import { useTeamStore } from '~/stores/teamStore'

const teams = useTeamStore()
await teams.hydrate()

const { data } = await useFetch<any>('/api/knockout')

const top5TeamIds = computed(() => {
  if (!data.value?.championRates) return []
  return Object.entries(data.value.championRates)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .map(([id]) => id)
})
</script>
<template>
  <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
    <h1 class="text-2xl font-bold dark:text-gray-100">淘汰赛对阵图</h1>
    <KnockoutTree v-if="data" :bracket="data.bracket" />

    <h2 class="text-xl font-bold dark:text-gray-100 pt-4">实时夺冠概率</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <ChampionLeaderboard v-if="data" :rates="data.championRates" />
      <ProbabilityTrend v-if="top5TeamIds.length > 0" :team-ids="top5TeamIds" :max-lines="5" />
    </div>
  </div>
</template>
