<script setup lang="ts">
const factors = [
  { label: 'FIFA 排名', weight: 25 },
  { label: '近一年胜率', weight: 25 },
  { label: '攻防数据', weight: 20 },
  { label: '小组赛表现', weight: 15 },
  { label: '阵容完整度', weight: 15 },
]
</script>
<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
    <h3 class="font-semibold mb-3">预测权重</h3>
    <div class="space-y-2 text-sm">
      <div v-for="f in factors" :key="f.label" class="flex items-center gap-3">
        <span class="w-24">{{ f.label }}</span>
        <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
          <div class="h-full bg-brand" :style="{ width: f.weight * 4 + '%' }" />
        </div>
        <span class="tabular-nums w-10 text-right">{{ f.weight }}%</span>
      </div>
    </div>
  </div>
</template>
