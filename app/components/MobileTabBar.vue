<script setup lang="ts">
const tabs = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/groups/A', label: '小组', icon: '🏆' },
  { to: '/knockout', label: '淘汰', icon: '🌳' },
  { to: '/stats', label: '榜单', icon: '📊' },
]
</script>
<template>
  <nav class="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]">
    <div class="grid grid-cols-4 h-16">
      <NuxtLink v-for="t in tabs" :key="t.to" :to="t.to"
        class="flex flex-col items-center justify-center gap-1 text-xs"
        active-class="text-brand-accent">
        <span class="text-lg">{{ t.icon }}</span>
        <span>{{ t.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
