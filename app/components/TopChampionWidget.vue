<script setup lang="ts">
import { useTeamStore } from '~/stores/teamStore'
const teams = useTeamStore()
</script>
<template>
  <section class="relative bg-wc-blue border-2 border-black overflow-hidden">
    <!-- Trophy gold accent -->
    <div class="trophy-line"></div>

    <!-- Trophy silhouette background -->
    <div class="absolute top-1/2 right-8 -translate-y-1/2 text-9xl opacity-10 pointer-events-none">🏆</div>

    <div class="relative p-6">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-3xl">🏆</span>
        <h2 class="font-display text-2xl text-white uppercase tracking-tight">夺冠概率 TOP 5</h2>
      </div>

      <ol class="space-y-3">
        <li v-for="(t, i) in teams.top5" :key="t.id"
          class="flex items-center gap-3 p-3 bg-white/10 border border-white/20 hover:bg-white/20 transition-colors group">
          <!-- Rank -->
          <span class="font-display text-3xl text-wc-gold w-10 text-center">{{ i + 1 }}</span>

          <!-- Flag -->
          <span v-if="t.flagEmoji" class="text-3xl">{{ t.flagEmoji }}</span>

          <!-- Team name -->
          <NuxtLink :to="`/teams/${t.id}`"
            class="flex-1 font-bold text-white truncate group-hover:text-wc-gold transition-colors">
            {{ t.name }}
          </NuxtLink>

          <!-- Percentage -->
          <div class="text-right">
            <div class="font-display text-2xl text-wc-gold tabular-nums">
              {{ t.championRate.toFixed(1) }}<span class="text-lg">%</span>
            </div>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
