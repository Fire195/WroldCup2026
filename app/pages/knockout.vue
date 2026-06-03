<script setup lang="ts">
import KnockoutTree from '~/components/KnockoutTree.vue'
import ChampionLeaderboard from '~/components/ChampionLeaderboard.vue'
import { useTeamStore } from '~/stores/teamStore'

const teams = useTeamStore()
await teams.hydrate()

const { data } = await useFetch<any>('/api/knockout')
</script>
<template>
  <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
    <h1 class="text-2xl font-bold">淘汰赛对阵图</h1>
    <KnockoutTree v-if="data" :bracket="data.bracket" />

    <h2 class="text-xl font-bold pt-4">实时夺冠概率</h2>
    <ChampionLeaderboard v-if="data" :rates="data.championRates" />
  </div>
</template>
