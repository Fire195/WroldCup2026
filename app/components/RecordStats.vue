<script setup lang="ts">
import type { RecentRecord } from '~/types'
const props = defineProps<{ record: RecentRecord }>()
const winRate = computed(() => Math.round((props.record.win / props.record.matches) * 100))
const drawRate = computed(() => Math.round((props.record.draw / props.record.matches) * 100))
const loseRate = computed(() => 100 - winRate.value - drawRate.value)
</script>
<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
    <h2 class="font-semibold dark:text-gray-100">近 12 个月战绩</h2>
    <div class="grid grid-cols-3 gap-3 text-center">
      <div><div class="text-2xl font-bold dark:text-gray-100">{{ record.matches }}</div><div class="text-xs text-gray-500 dark:text-gray-400">出战</div></div>
      <div><div class="text-2xl font-bold text-green-600 dark:text-green-500">{{ record.win }}</div><div class="text-xs text-gray-500 dark:text-gray-400">胜</div></div>
      <div><div class="text-2xl font-bold text-gray-500 dark:text-gray-400">{{ record.draw }}</div><div class="text-xs text-gray-500 dark:text-gray-400">平</div></div>
    </div>
    <div class="flex h-3 rounded overflow-hidden">
      <div class="bg-green-500" :style="{ width: winRate + '%' }" />
      <div class="bg-gray-400" :style="{ width: drawRate + '%' }" />
      <div class="bg-red-400" :style="{ width: loseRate + '%' }" />
    </div>
    <div class="grid grid-cols-3 gap-3 text-center text-sm">
      <div><div class="font-bold dark:text-gray-100">{{ record.goalsFor }}</div><div class="text-xs text-gray-500 dark:text-gray-400">进球</div></div>
      <div><div class="font-bold dark:text-gray-100">{{ record.goalsAgainst }}</div><div class="text-xs text-gray-500 dark:text-gray-400">失球</div></div>
      <div><div class="font-bold dark:text-gray-100">{{ record.avgPoints.toFixed(2) }}</div><div class="text-xs text-gray-500 dark:text-gray-400">场均积分</div></div>
    </div>
  </div>
</template>
