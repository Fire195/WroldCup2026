<script setup lang="ts">
import { useTeamStore } from '~/stores/teamStore'
const teams = useTeamStore()
</script>
<template>
  <section class="rounded-xl bg-gradient-to-br from-brand to-brand-accent p-5 text-white">
    <h2 class="text-lg font-bold mb-3">夺冠概率 TOP 5</h2>
    <ol class="space-y-2">
      <li v-for="(t, i) in teams.top5" :key="t.id" class="flex items-center gap-3">
        <span class="font-bold w-6 text-center">{{ i + 1 }}</span>
        <span v-if="t.flagEmoji" class="text-lg">{{ t.flagEmoji }}</span>
        <NuxtLink :to="`/teams/${t.id}`" class="flex-1 truncate hover:underline">{{ t.name }}</NuxtLink>
        <span class="font-mono tabular-nums">{{ t.championRate.toFixed(1) }}%</span>
      </li>
    </ol>
  </section>
</template>
