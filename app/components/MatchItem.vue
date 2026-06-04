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
    class="block relative bg-white border-2 border-black hover:shadow-brutal transition-all hover:-translate-y-0.5 group">
    <!-- Green accent bar -->
    <div class="absolute top-0 left-0 w-1 h-full bg-wc-green"></div>

    <div class="p-4 pl-5">
      <!-- Header: time + status -->
      <div class="flex items-center justify-between mb-3">
        <span class="font-mono text-xs text-wc-gray">{{ time }}</span>
        <span
          :class="{
            'pill-pending': match.status === 'pending',
            'pill-live': match.status === 'live',
            'pill-ended': match.status === 'ended',
          }">
          {{ { pending: '未开始', live: '进行中', ended: '已结束' }[match.status] }}
        </span>
      </div>

      <!-- Match: teams + score -->
      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <!-- Home team -->
        <div class="text-right">
          <div class="flex items-center justify-end gap-2">
            <span class="font-bold text-sm truncate">{{ home?.name }}</span>
            <span v-if="home?.flagEmoji" class="text-2xl flex-shrink-0">{{ home.flagEmoji }}</span>
          </div>
        </div>

        <!-- Score / VS -->
        <div class="text-center min-w-[80px]">
          <template v-if="match.result">
            <div class="font-display text-3xl tracking-tighter leading-none">
              {{ match.result.homeScore }}<span class="text-wc-gray mx-1">:</span>{{ match.result.awayScore }}
            </div>
          </template>
          <template v-else>
            <div class="font-bold text-wc-gray text-sm">VS</div>
          </template>
        </div>

        <!-- Away team -->
        <div class="text-left">
          <div class="flex items-center gap-2">
            <span v-if="away?.flagEmoji" class="text-2xl flex-shrink-0">{{ away.flagEmoji }}</span>
            <span class="font-bold text-sm truncate">{{ away?.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
