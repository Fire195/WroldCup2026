<script setup lang="ts">
import type { Player } from '~/types'
defineProps<{ players: Player[] }>()
const positionLabel = { GK: '门将', DF: '后卫', MF: '中场', FW: '前锋' } as const
</script>
<template>
  <div class="space-y-4">
    <div v-for="pos in (['GK','DF','MF','FW'] as const)" :key="pos">
      <h3 class="font-semibold mb-2 text-sm text-gray-500 dark:text-gray-400">{{ positionLabel[pos] }}</h3>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <div v-for="p in players.filter(x => x.position === pos)" :key="p.id"
          class="flex items-center gap-3 p-2 rounded-lg border border-gray-200 dark:border-gray-800 min-h-[44px]">
          <span class="font-bold text-brand w-8 text-center tabular-nums">{{ p.number }}</span>
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate dark:text-gray-100">{{ p.name }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ p.club }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
