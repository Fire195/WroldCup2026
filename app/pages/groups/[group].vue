<script setup lang="ts">
import GroupTabs from '~/components/GroupTabs.vue'
import GroupTable from '~/components/GroupTable.vue'
import MatchList from '~/components/MatchList.vue'
import QualifyChance from '~/components/QualifyChance.vue'
import { useTeamStore } from '~/stores/teamStore'

const route = useRoute()
const group = computed(() => (route.params.group as string).toUpperCase())
const teams = useTeamStore()
await teams.hydrate()

const { data } = await useFetch<{ standings: any[]; fixtures: any[] }>(
  () => `/api/groups/${group.value}`,
  { watch: [group], default: () => ({ standings: [], fixtures: [] }) }
)
</script>
<template>
  <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
    <GroupTabs />
    <h1 class="text-2xl font-bold dark:text-gray-100">{{ group }} 组</h1>

    <section>
      <h2 class="text-lg font-semibold dark:text-gray-100 mb-3">积分榜</h2>
      <GroupTable v-if="data" :standings="data.standings" />
    </section>

    <section>
      <h2 class="text-lg font-semibold dark:text-gray-100 mb-3">出线概率</h2>
      <QualifyChance v-if="data" :standings="data.standings" />
    </section>

    <section>
      <h2 class="text-lg font-semibold dark:text-gray-100 mb-3">赛程</h2>
      <MatchList v-if="data" :matches="data.fixtures" />
    </section>
  </div>
</template>
