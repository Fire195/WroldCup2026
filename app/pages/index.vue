<script setup lang="ts">
import { useTeamStore } from '~/stores/teamStore'
import { useMatchStore } from '~/stores/matchStore'
import MatchItem from '~/components/MatchItem.vue'
import TopChampionWidget from '~/components/TopChampionWidget.vue'

const teams = useTeamStore()
const matches = useMatchStore()
await Promise.all([teams.hydrate(), matches.hydrate()])

const todayMatches = computed(() => matches.today)
const latestEnded = computed(() => matches.latestEnded)
</script>
<template>
  <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
    <TopChampionWidget />

    <section>
      <h2 class="text-xl font-bold mb-3">今日赛事</h2>
      <div v-if="todayMatches.length === 0" class="text-gray-500 text-sm py-8 text-center">
        今日无比赛
      </div>
      <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MatchItem v-for="m in todayMatches" :key="m.id" :match="m" />
      </div>
    </section>

    <section>
      <h2 class="text-xl font-bold mb-3">最新赛果</h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MatchItem v-for="m in latestEnded" :key="m.id" :match="m" />
      </div>
    </section>
  </div>
</template>
