<script setup lang="ts">
import type { Match, MatchStage } from '~/types'
import { useTeamStore } from '~/stores/teamStore'

const props = defineProps<{ bracket: Record<MatchStage, Match[]> }>()
const teams = useTeamStore()
const stages: { key: MatchStage; label: string }[] = [
  { key: 'r32', label: '32 强' },
  { key: 'r16', label: '16 强' },
  { key: 'qf', label: '8 强' },
  { key: 'sf', label: '半决赛' },
  { key: 'final', label: '决赛' },
]
const activeIndex = ref(0)
const teamName = (id: string) => teams.byId(id)?.name ?? id
function eliminated(m: Match, side: 'home'|'away'): boolean {
  if (m.status !== 'ended' || !m.result) return false
  return side === 'home'
    ? m.result.homeScore < m.result.awayScore
    : m.result.awayScore < m.result.homeScore
}
</script>
<template>
  <div>
    <div class="md:hidden mb-3 flex gap-2 overflow-x-auto">
      <button v-for="(s, i) in stages" :key="s.key"
        class="px-3 py-2 rounded text-xs font-semibold border min-w-[64px]"
        :class="i === activeIndex ? 'bg-brand text-white border-brand' : 'border-gray-300 dark:border-gray-700'"
        @click="activeIndex = i">{{ s.label }}</button>
    </div>

    <div class="md:hidden space-y-3">
      <div v-for="m in (stages[activeIndex] && props.bracket[stages[activeIndex]!.key]) || []" :key="m.id"
        class="rounded-lg border border-gray-200 dark:border-gray-800 p-3 text-sm">
        <div class="flex justify-between" :class="eliminated(m,'home') ? 'opacity-40 line-through' : ''">
          <span>{{ teamName(m.homeTeamId) }}</span>
          <span class="tabular-nums">{{ m.result?.homeScore ?? '-' }}</span>
        </div>
        <div class="flex justify-between" :class="eliminated(m,'away') ? 'opacity-40 line-through' : ''">
          <span>{{ teamName(m.awayTeamId) }}</span>
          <span class="tabular-nums">{{ m.result?.awayScore ?? '-' }}</span>
        </div>
      </div>
    </div>

    <div class="hidden md:grid gap-4 overflow-x-auto pb-4"
      :style="`grid-template-columns: repeat(${stages.length}, minmax(180px, 1fr));`">
      <div v-for="s in stages" :key="s.key" class="space-y-3">
        <h3 class="text-center text-xs uppercase font-semibold text-gray-500">{{ s.label }}</h3>
        <div v-for="m in props.bracket[s.key]" :key="m.id"
          class="rounded-lg border border-gray-200 dark:border-gray-800 p-2 text-sm">
          <div class="flex justify-between" :class="eliminated(m,'home') ? 'opacity-40 line-through' : ''">
            <span class="truncate">{{ teamName(m.homeTeamId) }}</span>
            <span class="tabular-nums">{{ m.result?.homeScore ?? '-' }}</span>
          </div>
          <div class="flex justify-between" :class="eliminated(m,'away') ? 'opacity-40 line-through' : ''">
            <span class="truncate">{{ teamName(m.awayTeamId) }}</span>
            <span class="tabular-nums">{{ m.result?.awayScore ?? '-' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
