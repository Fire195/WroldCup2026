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
  <header class="sticky top-0 z-30 bg-white border-b-4 border-black">
    <!-- Trophy gold accent line -->
    <div class="trophy-line"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <!-- Brand mark with stacked 26 -->
      <NuxtLink to="/" class="flex items-center gap-3">
        <div class="relative w-10 h-10 flex-shrink-0">
          <div class="absolute inset-0 bg-wc-blue"></div>
          <div class="absolute inset-0 m-0.5 bg-wc-green flex items-center justify-center">
            <span class="font-display text-white text-xl tracking-tighter leading-none">26</span>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="font-display text-xl leading-none tracking-tight text-black">FIFA WORLD CUP</span>
          <span class="font-mono text-[10px] text-wc-gray tracking-widest">PREDICT · 2026</span>
        </div>
      </NuxtLink>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to"
          class="relative px-4 py-2 font-bold text-sm uppercase tracking-wide text-black hover:text-wc-green transition-colors group"
          active-class="!text-wc-green">
          {{ l.label }}
          <span class="absolute bottom-0 left-4 right-4 h-0.5 bg-wc-green scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
        </NuxtLink>
      </nav>

      <ThemeToggle />
    </div>
  </header>
</template>
