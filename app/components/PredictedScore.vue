<script setup lang="ts">
defineProps<{ bestScore: string; confidence: number; homeName: string; awayName: string }>()
</script>
<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-5 text-center">
    <div class="text-xs text-gray-500 uppercase">预测比分</div>
    <div class="my-2 text-3xl font-bold tabular-nums">
      <span>{{ homeName }}</span>
      <span class="mx-3 text-brand-accent">{{ bestScore }}</span>
      <span>{{ awayName }}</span>
    </div>
    <div class="text-xs text-gray-500">信心指数 {{ Math.round(confidence * 100) }}%</div>
  </div>
</template>
