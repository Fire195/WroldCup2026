<script setup lang="ts">
import { useTeamStore } from '~/stores/teamStore'
const teams = useTeamStore()
</script>
<template>
  <section class="card-refined p-6 bg-gradient-to-br from-wc-blue to-wc-blue/80 text-white">
    <div class="flex items-center gap-3 mb-5">
      <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
        🏆
      </div>
      <div>
        <h2 class="text-xl font-bold">夺冠概率</h2>
        <p class="text-xs text-white/70 font-medium">TOP 5 预测</p>
      </div>
    </div>

    <ol class="space-y-3">
      <li v-for="(t, i) in teams.top5" :key="t.id"
        class="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors group">
        <!-- Rank -->
        <span class="w-8 h-8 rounded-lg bg-wc-gold text-wc-blue font-bold text-sm flex items-center justify-center">
          {{ i + 1 }}
        </span>

        <!-- Flag + Name -->
        <span v-if="t.flagEmoji" class="text-3xl">{{ t.flagEmoji }}</span>
        <NuxtLink :to="`/teams/${t.id}`"
          class="flex-1 font-semibold truncate group-hover:text-wc-gold transition-colors">
          {{ t.name }}
        </NuxtLink>

        <!-- Rate -->
        <div class="text-right">
          <div class="font-bold text-xl tabular-nums">
            {{ t.championRate.toFixed(1) }}<span class="text-sm text-white/70">%</span>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>
