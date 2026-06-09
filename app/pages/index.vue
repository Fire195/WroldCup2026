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
    <!-- Hero -->
    <section class="relative bg-gradient-to-br from-wc-blue via-wc-blue to-wc-green overflow-hidden">
      <!-- Background image with overlay -->
      <div class="absolute inset-0 bg-[url('/hero-bg.webp')] bg-cover bg-center opacity-30"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-wc-blue/80 via-wc-blue/75 to-wc-green/80"></div>

      <!-- Decorative pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-20 right-20 w-48 h-48 rounded-full border-4 border-white/30"></div>
        <div class="absolute bottom-20 left-20 w-32 h-32 rounded-full border-4 border-white/30"></div>
      </div>

      <div class="max-w-6xl mx-auto px-4 py-16 md:py-24 relative">
        <div class="flex flex-col md:flex-row items-center justify-between gap-12">
          <div class="text-white text-center md:text-left">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-semibold mb-6">
              <span>⚡</span>
              <span>AI 实时预测</span>
            </div>
            <h1 class="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              2026 FIFA<br>World Cup
            </h1>
            <p class="text-lg text-white/80 mb-8 max-w-md">
              基于深度学习的赛事预测，实时更新夺冠概率与比赛结果
            </p>
            <div class="flex flex-wrap gap-3 justify-center md:justify-start">
              <NuxtLink to="/knockout" class="btn-primary">
                查看淘汰赛对阵
              </NuxtLink>
              <NuxtLink to="/groups/A"
                class="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-all">
                小组赛积分榜
              </NuxtLink>
            </div>
          </div>

          <div class="text-8xl md:text-9xl opacity-90">🏆</div>
        </div>
      </div>
    </section>

    <div class="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <!-- TOP 5 -->
      <TopChampionWidget />

      <!-- Today -->
      <section>
        <div class="flex items-center gap-3 mb-4">
          <h2 class="section-title">今日赛事</h2>
          <div class="accent-line"></div>
        </div>
        <div v-if="todayMatches.length === 0"
          class="card-refined p-12 text-center">
          <span class="text-5xl mb-3 block opacity-40">⚽</span>
          <p class="text-stone-500 dark:text-gray-400 font-medium">今日无比赛</p>
        </div>
        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MatchItem v-for="m in todayMatches" :key="m.id" :match="m" />
        </div>
      </section>

      <!-- Latest -->
      <section>
        <div class="flex items-center gap-3 mb-4">
          <h2 class="section-title">最新赛果</h2>
          <div class="accent-line"></div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MatchItem v-for="m in latestEnded" :key="m.id" :match="m" />
        </div>
      </section>
    </div>
  </div>
</template>
