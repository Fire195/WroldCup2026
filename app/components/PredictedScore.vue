<script setup lang="ts">
import type { ScorePrediction } from '~/types'

const props = defineProps<{
  topScores: ScorePrediction[]
  confidence: number
  homeName: string
  awayName: string
  actualScore?: string
}>()

const isMatched = (score: string) => props.actualScore === score
</script>
<template>
  <div class="card-refined p-5">
    <div class="text-xs text-stone-500 dark:text-gray-400 uppercase tracking-wide text-center mb-3">
      赛前预测 TOP 3
    </div>
    <ul class="space-y-2">
      <li v-for="(item, i) in topScores" :key="item.score"
        :class="[
          'flex items-center justify-between px-4 py-3 rounded-xl',
          isMatched(item.score)
            ? 'bg-wc-green/10 border border-wc-green/30'
            : 'bg-stone-50 dark:bg-gray-800/50',
        ]">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-stone-200 dark:bg-gray-700 text-stone-700 dark:text-gray-200 text-sm font-bold flex items-center justify-center">
            {{ i + 1 }}
          </span>
          <span class="text-2xl font-bold tabular-nums dark:text-gray-100">
            <span class="text-stone-600 dark:text-gray-400 text-base font-medium mr-2">{{ homeName }}</span>
            <span class="text-brand-accent">{{ item.score }}</span>
            <span class="text-stone-600 dark:text-gray-400 text-base font-medium ml-2">{{ awayName }}</span>
          </span>
        </div>
        <span class="text-sm font-semibold tabular-nums text-stone-600 dark:text-gray-300">
          {{ (item.probability * 100).toFixed(1) }}%
        </span>
      </li>
    </ul>
    <div class="text-xs text-stone-500 dark:text-gray-400 text-center mt-3">
      信心指数 {{ Math.round(confidence * 100) }}%
    </div>
  </div>
</template>
