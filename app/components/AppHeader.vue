<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'
const links = [
  { to: '/', label: '首页' },
  { to: '/groups/A', label: '小组赛' },
  { to: '/knockout', label: '淘汰赛' },
  { to: '/stats', label: '榜单' },
]
</script>
<template>
  <header class="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-stone-200/60 dark:border-gray-800/60">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <!-- Brand -->
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-wc-green to-wc-blue flex items-center justify-center text-white font-bold text-lg shadow-soft">
          ⚽
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg text-stone-900 dark:text-gray-100 tracking-tight">World Cup 2026</span>
          <span class="text-2xs text-stone-500 dark:text-gray-400 font-medium">AI Predictions</span>
        </div>
      </NuxtLink>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-1">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to"
          class="px-4 py-2 text-sm font-medium text-stone-600 dark:text-gray-300 hover:text-stone-900 dark:hover:text-gray-100 rounded-lg hover:bg-stone-100/60 dark:hover:bg-gray-800/60 transition-all"
          active-class="!text-wc-green !bg-wc-green/10">
          {{ l.label }}
        </NuxtLink>
      </nav>

      <ThemeToggle />
    </div>
  </header>
</template>
