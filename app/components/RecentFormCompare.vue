<script setup lang="ts">
import type { Team } from '~/types'
defineProps<{ home: Team; away: Team }>()
</script>
<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
    <h3 class="font-semibold mb-4 text-center">近 12 个月战绩对比</h3>
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div class="text-center">
        <div class="font-bold">{{ home.name }}</div>
        <div class="text-xs text-gray-500 mb-2">{{ home.recentRecord.matches }} 战</div>
      </div>
      <div class="text-center">
        <div class="font-bold">{{ away.name }}</div>
        <div class="text-xs text-gray-500 mb-2">{{ away.recentRecord.matches }} 战</div>
      </div>
    </div>
    <div class="space-y-3 text-sm">
      <div v-for="row in [
        { label: '胜', h: home.recentRecord.win, a: away.recentRecord.win },
        { label: '平', h: home.recentRecord.draw, a: away.recentRecord.draw },
        { label: '负', h: home.recentRecord.lose, a: away.recentRecord.lose },
        { label: '进球', h: home.recentRecord.goalsFor, a: away.recentRecord.goalsFor },
        { label: '失球', h: home.recentRecord.goalsAgainst, a: away.recentRecord.goalsAgainst },
        { label: '场均得分', h: home.recentRecord.avgPoints, a: away.recentRecord.avgPoints },
      ]" :key="row.label" class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div class="text-right tabular-nums">{{ row.h }}</div>
        <div class="text-xs text-gray-500 px-2 min-w-[60px] text-center">{{ row.label }}</div>
        <div class="tabular-nums">{{ row.a }}</div>
      </div>
    </div>
  </div>
</template>
