<script setup lang="ts">
const { data, error } = await useFetch<any>('/api/stats')
</script>
<template>
  <div class="max-w-3xl mx-auto px-4 py-6 space-y-4">
    <h1 class="text-2xl font-bold dark:text-gray-100">射手榜</h1>
    <p v-if="data?.updatedAt" class="text-xs text-gray-500 dark:text-gray-400">
      更新于 {{ new Date(data.updatedAt).toLocaleString('zh-CN') }}
    </p>
    <div v-if="error" class="text-red-500 text-sm">榜单暂不可用，请稍后重试</div>
    <ol v-else-if="data" class="rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
      <li v-for="s in data.scorers" :key="s.rank" class="p-3 flex items-center gap-3 text-sm">
        <span class="w-8 text-center font-bold">{{ s.rank }}</span>
        <span class="flex-1 truncate">{{ s.player.name }}</span>
        <span class="text-xs text-gray-500 dark:text-gray-400 w-16">{{ s.team.tla }}</span>
        <span class="font-bold tabular-nums w-10 text-right">{{ s.goals }}</span>
      </li>
    </ol>
  </div>
</template>
