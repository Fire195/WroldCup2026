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
    class="card-refined p-4 hover:scale-[1.01] transition-transform">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs text-stone-500 font-medium">{{ time }}</span>
      <span
        :class="{
          'badge-pending': match.status === 'pending',
          'badge-live': match.status === 'live',
          'badge-ended': match.status === 'ended',
        }">
        {{ { pending: '未开始', live: '进行中', ended: '已结束' }[match.status] }}
      </span>
    </div>

    <!-- Teams + Score -->
    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      <!-- Home -->
      <div class="text-right">
        <div class="flex items-center justify-end gap-2">
          <span class="font-semibold text-sm truncate">{{ home?.name }}</span>
          <span v-if="home?.flagEmoji" class="text-2xl">{{ home.flagEmoji }}</span>
        </div>
      </div>

      <!-- Score / VS -->
      <div class="text-center min-w-[64px]">
        <template v-if="match.result">
          <div class="font-bold text-2xl text-stone-900 tabular-nums">
            {{ match.result.homeScore }}<span class="text-stone-400 mx-1">:</span>{{ match.result.awayScore }}
          </div>
        </template>
        <template v-else>
          <div class="text-xs font-semibold text-stone-400">VS</div>
        </template>
      </div>

      <!-- Away -->
      <div class="text-left">
        <div class="flex items-center gap-2">
          <span v-if="away?.flagEmoji" class="text-2xl">{{ away.flagEmoji }}</span>
          <span class="font-semibold text-sm truncate">{{ away?.name }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
