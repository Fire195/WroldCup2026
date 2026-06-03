<script setup lang="ts">
import type { Match } from '~/types'
import { useTeamStore } from '~/stores/teamStore'

const props = defineProps<{ match: Match }>()
const teamStore = useTeamStore()
const home = computed(() => teamStore.byId(props.match.homeTeamId))
const away = computed(() => teamStore.byId(props.match.awayTeamId))
const time = computed(() => new Date(props.match.matchTime).toLocaleString('zh-CN', {
  month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
}))
</script>
<template>
  <NuxtLink :to="`/matches/${match.id}`"
    class="block p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 min-h-[60px]">
    <div class="flex items-center justify-between text-sm">
      <span class="text-gray-500">{{ time }}</span>
      <span class="px-2 py-0.5 rounded text-xs"
        :class="{
          'bg-gray-200 dark:bg-gray-800': match.status === 'pending',
          'bg-red-100 text-red-700 animate-pulse': match.status === 'live',
          'bg-green-100 text-green-700': match.status === 'ended',
        }">
        {{ { pending: '未开始', live: '进行中', ended: '已结束' }[match.status] }}
      </span>
    </div>
    <div class="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <div class="text-right truncate">
        <span v-if="home?.flagEmoji" class="mr-1">{{ home.flagEmoji }}</span>{{ home?.name }}
      </div>
      <div class="text-center font-bold tabular-nums min-w-[64px]">
        <template v-if="match.result">{{ match.result.homeScore }} - {{ match.result.awayScore }}</template>
        <template v-else>VS</template>
      </div>
      <div class="truncate">
        <span v-if="away?.flagEmoji" class="mr-1">{{ away.flagEmoji }}</span>{{ away?.name }}
      </div>
    </div>
  </NuxtLink>
</template>
