<script setup lang="ts">
import type { Team } from '~/types'
import TeamFlag from './TeamFlag.vue'

defineProps<{ team: Team & { championRate: number } }>()
</script>
<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
    <div class="flex items-start gap-4">
      <TeamFlag :team-id="team.id" size="2xl" />
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-bold truncate dark:text-gray-100">{{ team.name }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ team.nameEn }} · 第 {{ team.group }} 组</p>
        <div class="mt-2 flex flex-wrap gap-2 text-xs">
          <span class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">FIFA 排名: {{ team.fifaRank }}</span>
          <span class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">积分: {{ team.fifaPoint }}</span>
          <span class="px-2 py-1 rounded bg-brand/10 text-brand">{{ team.style }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
