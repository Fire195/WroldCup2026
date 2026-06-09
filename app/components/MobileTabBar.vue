<script setup lang="ts">
const tabs = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/groups/A', label: '小组', icon: '🏟️' },
  { to: '/knockout', label: '淘汰', icon: '🏆' },
  { to: '/stats', label: '榜单', icon: '📊' },
]
</script>
<template>
  <nav class="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-stone-200/60 dark:border-gray-800/60 pb-[env(safe-area-inset-bottom)]">
    <div class="grid grid-cols-4 h-16 px-2">
      <NuxtLink v-for="t in tabs" :key="t.to" :to="t.to"
        class="flex flex-col items-center justify-center gap-1 text-xs font-medium text-stone-500 dark:text-gray-400 rounded-lg transition-colors"
        active-class="!text-wc-green !bg-wc-green/10">
        <span class="text-xl">{{ t.icon }}</span>
        <span class="text-2xs">{{ t.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
