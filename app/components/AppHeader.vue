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
  <header class="sticky top-0 z-30 bg-white/85 dark:bg-gray-950/85 backdrop-blur border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="font-bold text-lg text-brand">2026 World Cup</NuxtLink>
      <nav class="hidden md:flex gap-6">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to"
          class="text-sm hover:text-brand-accent" active-class="text-brand-accent font-semibold">
          {{ l.label }}
        </NuxtLink>
      </nav>
      <ThemeToggle />
    </div>
  </header>
</template>
