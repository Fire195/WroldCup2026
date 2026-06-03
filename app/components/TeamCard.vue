<script setup lang="ts">
import type { Team } from '~/types'
defineProps<{ team: Team & { championRate: number } }>()
</script>
<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
    <div class="flex items-start gap-4">
      <div v-if="team.flagEmoji" class="text-5xl leading-none flex-shrink-0">{{ team.flagEmoji }}</div>
      <img v-else :src="team.flag" :alt="team.name" class="w-16 h-12 object-cover rounded shadow"
        loading="lazy" width="64" height="48" />
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-bold truncate">{{ team.name }}</h1>
        <p class="text-sm text-gray-500">{{ team.nameEn }} · 第 {{ team.group }} 组</p>
        <div class="mt-2 flex flex-wrap gap-2 text-xs">
          <span class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">FIFA 排名: {{ team.fifaRank }}</span>
          <span class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">积分: {{ team.fifaPoint }}</span>
          <span class="px-2 py-1 rounded bg-brand/10 text-brand">{{ team.style }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
