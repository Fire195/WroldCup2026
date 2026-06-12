<script setup lang="ts">
interface AccuracyStats {
  total: number
  outcomeCorrect: number
  top1Correct: number
  top2Correct: number
  top3Correct: number
  updatedAt: string
}

const { data } = await useFetch<AccuracyStats>('/api/accuracy-stats')

const percent = (correct: number | undefined) => {
  if (!data.value || data.value.total === 0 || correct === undefined) return 0
  return Math.round((correct / data.value.total) * 100)
}

const outcomePercent = computed(() => percent(data.value?.outcomeCorrect))
const top1Percent = computed(() => percent(data.value?.top1Correct))
const top2Percent = computed(() => percent(data.value?.top2Correct))
const top3Percent = computed(() => percent(data.value?.top3Correct))

const hasData = computed(() => data.value && data.value.total > 0)
</script>

<template>
  <section class="card-refined p-6 bg-gradient-to-br from-stone-50 to-white dark:from-gray-800 dark:to-gray-900">
    <div class="flex items-center gap-3 mb-5">
      <div class="w-12 h-12 rounded-2xl bg-wc-blue/10 flex items-center justify-center text-2xl">
        📊
      </div>
      <div>
        <h2 class="text-xl font-bold dark:text-gray-100">预测战绩</h2>
        <p class="text-xs text-stone-500 dark:text-gray-400 font-medium">
          已结束 {{ data?.total ?? 0 }} 场
        </p>
      </div>
    </div>

    <div v-if="!hasData" class="text-center py-8 text-stone-500 dark:text-gray-400 text-sm">
      暂无数据，等待比赛结束
    </div>

    <div v-else class="space-y-4">
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium dark:text-gray-300">胜平负预测</span>
          <span class="text-sm font-bold tabular-nums dark:text-gray-100">
            {{ outcomePercent }}% ({{ data?.outcomeCorrect }}/{{ data?.total }})
          </span>
        </div>
        <div class="h-2 rounded-full bg-stone-200 dark:bg-gray-700 overflow-hidden">
          <div class="h-full bg-wc-green transition-all" :style="{ width: outcomePercent + '%' }"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium dark:text-gray-300">首选比分命中率</span>
          <span class="text-sm font-bold tabular-nums dark:text-gray-100">
            {{ top1Percent }}% ({{ data?.top1Correct ?? 0 }}/{{ data?.total }})
          </span>
        </div>
        <div class="h-2 rounded-full bg-stone-200 dark:bg-gray-700 overflow-hidden">
          <div class="h-full bg-wc-gold transition-all" :style="{ width: top1Percent + '%' }"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium dark:text-gray-300">次选比分命中率</span>
          <span class="text-sm font-bold tabular-nums dark:text-gray-100">
            {{ top2Percent }}% ({{ data?.top2Correct ?? 0 }}/{{ data?.total }})
          </span>
        </div>
        <div class="h-2 rounded-full bg-stone-200 dark:bg-gray-700 overflow-hidden">
          <div class="h-full bg-amber-500 transition-all" :style="{ width: top2Percent + '%' }"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium dark:text-gray-300">第3选比分命中率</span>
          <span class="text-sm font-bold tabular-nums dark:text-gray-100">
            {{ top3Percent }}% ({{ data?.top3Correct ?? 0 }}/{{ data?.total }})
          </span>
        </div>
        <div class="h-2 rounded-full bg-stone-200 dark:bg-gray-700 overflow-hidden">
          <div class="h-full bg-amber-400 transition-all" :style="{ width: top3Percent + '%' }"></div>
        </div>
      </div>
    </div>
  </section>
</template>
