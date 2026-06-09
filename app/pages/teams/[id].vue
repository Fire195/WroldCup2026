<script setup lang="ts">
import TeamCard from '~/components/TeamCard.vue'
import SquadTable from '~/components/SquadTable.vue'
import RecordStats from '~/components/RecordStats.vue'
import StrengthWeakness from '~/components/StrengthWeakness.vue'
import ChampionRateBadge from '~/components/ChampionRateBadge.vue'
import MatchItem from '~/components/MatchItem.vue'
import { useTeamStore } from '~/stores/teamStore'
import { useMatchStore } from '~/stores/matchStore'

const route = useRoute()
const id = computed(() => route.params.id as string)

const teams = useTeamStore()
const matches = useMatchStore()
await Promise.all([teams.hydrate(), matches.hydrate()])

const team = computed(() => teams.byId(id.value))
if (!team.value) throw createError({ statusCode: 404, statusMessage: 'Team not found' })

const { data: players } = await useFetch<any[]>(() => `/api/players/${id.value}`, { watch: [id] })

const teamMatches = computed(() =>
  matches.matches.filter(m => m.homeTeamId === id.value || m.awayTeamId === id.value)
)
</script>
<template>
  <div v-if="team" class="max-w-6xl mx-auto px-4 py-6 space-y-6">
    <TeamCard :team="team" />
    <ChampionRateBadge :rate="team.championRate" />

    <RecordStats :record="team.recentRecord" />

    <StrengthWeakness :strength="team.strength" :weakness="team.weakness" />

    <section>
      <h2 class="text-lg font-bold dark:text-gray-100 mb-3">阵容</h2>
      <SquadTable :players="players ?? []" />
    </section>

    <section>
      <h2 class="text-lg font-bold dark:text-gray-100 mb-3">本届赛程</h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MatchItem v-for="m in teamMatches" :key="m.id" :match="m" />
      </div>
    </section>
  </div>
</template>
