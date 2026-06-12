<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  homeName: string
  awayName: string
  homeScore: number
  awayScore: number
  predictedScore: string
  predictedHomeWin: number
  predictedDraw: number
  predictedAwayWin: number
}>()

const actualOutcome = computed<'home' | 'draw' | 'away'>(() => {
  if (props.homeScore > props.awayScore) return 'home'
  if (props.homeScore < props.awayScore) return 'away'
  return 'draw'
})

const predictedOutcome = computed<'home' | 'draw' | 'away'>(() => {
  const max = Math.max(props.predictedHomeWin, props.predictedDraw, props.predictedAwayWin)
  if (props.predictedHomeWin === max) return 'home'
  if (props.predictedAwayWin === max) return 'away'
  return 'draw'
})

const outcomeCorrect = computed(() => actualOutcome.value === predictedOutcome.value)

const actualScoreString = computed(() => `${props.homeScore}-${props.awayScore}`)
const scoreCorrect = computed(() => props.predictedScore === actualScoreString.value)
</script>

<template>
  <div class="card-refined p-6 text-center">
    <div class="text-xs text-stone-500 dark:text-gray-400 uppercase tracking-wide mb-3">
      实际比分
    </div>
    <div class="text-4xl font-bold tabular-nums dark:text-gray-100 mb-4">
      <span class="text-stone-600 dark:text-gray-400 text-xl font-medium mr-3">{{ homeName }}</span>
      <span>{{ homeScore }}-{{ awayScore }}</span>
      <span class="text-stone-600 dark:text-gray-400 text-xl font-medium ml-3">{{ awayName }}</span>
    </div>
    <div class="flex justify-center gap-2 flex-wrap">
      <span :class="[
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold',
        outcomeCorrect
          ? 'bg-wc-green/15 text-wc-green'
          : 'bg-stone-200 text-stone-600 dark:bg-gray-700 dark:text-gray-300',
      ]">
        <span>{{ outcomeCorrect ? '✓' : '✗' }}</span>
        <span>胜负预测{{ outcomeCorrect ? '正确' : '错误' }}</span>
      </span>
      <span :class="[
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold',
        scoreCorrect
          ? 'bg-wc-gold/15 text-amber-600 dark:text-wc-gold'
          : 'bg-stone-200 text-stone-600 dark:bg-gray-700 dark:text-gray-300',
      ]">
        <span>{{ scoreCorrect ? '✓' : '✗' }}</span>
        <span>比分预测{{ scoreCorrect ? '正确' : '错误' }}</span>
      </span>
    </div>
  </div>
</template>
