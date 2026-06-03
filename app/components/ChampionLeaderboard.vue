<script setup lang="ts">
import { useTeamStore } from '~/stores/teamStore'
const props = defineProps<{ rates: Record<string, number> }>()
const teams = useTeamStore()
const sorted = computed(() =>
  Object.entries(props.rates)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([id, v]) => ({ id, rate: v, team: teams.byId(id) }))
)
</script>
<template>
  <ol class="rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
    <li v-for="(item, i) in sorted" :key="item.id" class="flex items-center gap-3 p-3">
      <span class="w-6 text-center font-bold tabular-nums">{{ i + 1 }}</span>
      <NuxtLink v-if="item.team" :to="`/teams/${item.id}`" class="flex-1 truncate hover:text-brand-accent">
        {{ item.team.name }}
      </NuxtLink>
      <div class="w-32 h-2 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
        <div class="h-full bg-gradient-to-r from-brand to-brand-accent" :style="{ width: Math.min(100, item.rate * 4) + '%' }" />
      </div>
      <span class="font-mono tabular-nums w-14 text-right">{{ item.rate.toFixed(1) }}%</span>
    </li>
  </ol>
</template>
