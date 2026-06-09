<script setup lang="ts">
import RecentFormCompare from '~/components/RecentFormCompare.vue'
import ProbabilityBar from '~/components/ProbabilityBar.vue'
import PredictedScore from '~/components/PredictedScore.vue'
import KeyFactors from '~/components/KeyFactors.vue'
import { useTeamStore } from '~/stores/teamStore'

const route = useRoute()
const id = computed(() => route.params.id as string)

const teams = useTeamStore()
await teams.hydrate()

const { data: match } = await useFetch<any>(() => `/api/matches/${id.value}`, { watch: [id] })

const home = computed(() => match.value && teams.byId(match.value.homeTeamId))
const away = computed(() => match.value && teams.byId(match.value.awayTeamId))
</script>
<template>
  <div v-if="match && home && away" class="max-w-3xl mx-auto px-4 py-6 space-y-5">
    <h1 class="text-xl font-bold text-center dark:text-gray-100">
      <NuxtLink :to="`/teams/${home.id}`" class="hover:text-brand">{{ home.name }}</NuxtLink>
      <span class="mx-3 text-gray-400 dark:text-gray-500">VS</span>
      <NuxtLink :to="`/teams/${away.id}`" class="hover:text-brand">{{ away.name }}</NuxtLink>
    </h1>
    <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
      {{ new Date(match.matchTime).toLocaleString('zh-CN') }} · {{ match.venue }}
    </p>

    <PredictedScore v-if="match.prediction"
      :best-score="match.prediction.bestScore"
      :confidence="match.prediction.confidence"
      :home-name="home.name" :away-name="away.name" />

    <ProbabilityBar v-if="match.prediction"
      :home-win="match.prediction.homeWin"
      :draw="match.prediction.draw"
      :away-win="match.prediction.awayWin"
      :home-name="home.name" :away-name="away.name" />

    <RecentFormCompare :home="home" :away="away" />
    <KeyFactors />
  </div>
</template>
