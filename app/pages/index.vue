<script setup lang="ts">
import { useTeamStore } from '~/stores/teamStore'
import { useMatchStore } from '~/stores/matchStore'
import MatchItem from '~/components/MatchItem.vue'
import TopChampionWidget from '~/components/TopChampionWidget.vue'

const teams = useTeamStore()
const matches = useMatchStore()
await Promise.all([teams.hydrate(), matches.hydrate()])

const todayMatches = computed(() => matches.today)
const latestEnded = computed(() => matches.latestEnded)
</script>
<template>
  <div>
    <!-- Hero Section -->
    <section class="relative bg-wc-blue border-b-4 border-black overflow-hidden">
      <div class="trophy-line"></div>

      <!-- Geometric background pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 right-10 w-32 h-32 border-4 border-white rotate-45"></div>
        <div class="absolute bottom-10 left-10 w-40 h-40 rounded-full border-4 border-white"></div>
      </div>

      <div class="max-w-6xl mx-auto px-4 py-12 relative">
        <div class="flex flex-col md:flex-row items-center justify-between gap-8">
          <div class="text-white">
            <div class="eyebrow text-wc-gold mb-2">AI 驱动预测引擎</div>
            <h1 class="font-display text-5xl md:text-6xl mb-4 tracking-tight leading-none">
              2026 FIFA<br>WORLD CUP
            </h1>
            <p class="text-lg opacity-90 mb-6">实时数据 · 深度分析 · 夺冠概率</p>
            <div class="flex gap-3">
              <NuxtLink to="/knockout" class="btn-primary">淘汰赛对阵</NuxtLink>
              <NuxtLink to="/groups/A"
                class="px-6 py-3 bg-white text-wc-blue font-bold uppercase tracking-wider border-2 border-black hover:bg-wc-gold hover:text-white transition-colors">
                查看小组赛
              </NuxtLink>
            </div>
          </div>

          <div class="text-9xl md:text-[12rem] animate-subtle-pulse">🏆</div>
        </div>
      </div>
    </section>

    <div class="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <!-- TOP 5 Widget -->
      <TopChampionWidget />

      <!-- Today's Matches -->
      <section>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-1 h-8 bg-wc-green"></div>
          <h2 class="font-display text-3xl uppercase tracking-tight">今日赛事</h2>
        </div>
        <div v-if="todayMatches.length === 0"
          class="text-center py-12 border-2 border-dashed border-gray-300">
          <span class="text-4xl mb-2 block">⚽</span>
          <p class="text-wc-gray font-bold">今日无比赛</p>
        </div>
        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MatchItem v-for="m in todayMatches" :key="m.id" :match="m" />
        </div>
      </section>

      <!-- Latest Results -->
      <section>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-1 h-8 bg-wc-red"></div>
          <h2 class="font-display text-3xl uppercase tracking-tight">最新赛果</h2>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MatchItem v-for="m in latestEnded" :key="m.id" :match="m" />
        </div>
      </section>
    </div>
  </div>
</template>
