<script setup lang="ts">
import type { Match, MatchStage } from '~/types'
import { useTeamStore } from '~/stores/teamStore'

const props = defineProps<{ bracket: Record<MatchStage, Match[]> }>()
const teams = useTeamStore()

const leftR16 = computed(() => props.bracket.r16?.slice(0, 4) || [])
const leftQF = computed(() => props.bracket.qf?.slice(0, 2) || [])
const leftSF = computed(() => props.bracket.sf?.[0])
const rightR16 = computed(() => props.bracket.r16?.slice(4, 8) || [])
const rightQF = computed(() => props.bracket.qf?.slice(2, 4) || [])
const rightSF = computed(() => props.bracket.sf?.[1])
const final = computed(() => props.bracket.final?.[0])

const teamName = (id: string) => teams.byId(id)?.name ?? id
const teamFlag = (id: string) => teams.byId(id)?.flagEmoji ?? ''

function getWinner(m?: Match): 'home' | 'away' | null {
  if (!m || m.status !== 'ended' || !m.result) return null
  if (m.result.homeScore > m.result.awayScore) return 'home'
  if (m.result.awayScore > m.result.homeScore) return 'away'
  return null
}

function isEliminated(m: Match, side: 'home' | 'away'): boolean {
  const winner = getWinner(m)
  if (!winner) return false
  return side !== winner
}

function isWinner(m: Match, side: 'home' | 'away'): boolean {
  const winner = getWinner(m)
  return winner === side
}
</script>

<template>
  <div class="w-full">
    <!-- 移动端 -->
    <div class="md:hidden space-y-4 px-4">
      <!-- 决赛卡片 -->
      <div v-if="final" class="relative bg-wc-gold border-4 border-black p-6">
        <div class="trophy-line mb-4"></div>
        <div class="text-center mb-4">
          <div class="text-6xl mb-2">🏆</div>
          <div class="font-display text-2xl uppercase">决赛 FINAL</div>
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-white border-2 border-black"
            :class="isEliminated(final, 'home') ? 'opacity-40' : ''">
            <span class="text-3xl">{{ teamFlag(final.homeTeamId) }}</span>
            <span class="font-bold">{{ teamName(final.homeTeamId) }}</span>
            <span class="font-display text-3xl">{{ final.result?.homeScore ?? '-' }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-white border-2 border-black"
            :class="isEliminated(final, 'away') ? 'opacity-40' : ''">
            <span class="text-3xl">{{ teamFlag(final.awayTeamId) }}</span>
            <span class="font-bold">{{ teamName(final.awayTeamId) }}</span>
            <span class="font-display text-3xl">{{ final.result?.awayScore ?? '-' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 桌面端：对称树 -->
    <div class="hidden md:block min-w-[1400px] py-8 px-6">
      <div class="grid grid-cols-[1fr_1fr_2fr_1fr_1fr] gap-6 items-center">
        <!-- 左侧 R16 -->
        <div class="space-y-6">
          <div v-for="(m, idx) in leftR16" :key="m.id"
            class="bg-white border-2 border-black p-3 hover:shadow-brutal transition-all"
            :class="idx % 2 === 0 ? '' : 'mt-16'">
            <div class="absolute top-0 left-0 w-1 h-full bg-wc-green"></div>
            <div class="space-y-2">
              <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-30' : ''">
                <span class="text-2xl">{{ teamFlag(m.homeTeamId) }}</span>
                <span class="font-bold text-sm flex-1 mx-2 truncate">{{ teamName(m.homeTeamId) }}</span>
                <span class="font-display text-xl">{{ m.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="h-px bg-black"></div>
              <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-30' : ''">
                <span class="text-2xl">{{ teamFlag(m.awayTeamId) }}</span>
                <span class="font-bold text-sm flex-1 mx-2 truncate">{{ teamName(m.awayTeamId) }}</span>
                <span class="font-display text-xl">{{ m.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 左侧 QF -->
        <div class="space-y-24">
          <div v-for="m in leftQF" :key="m.id"
            class="bg-wc-green/10 border-2 border-wc-green p-4 hover:shadow-brutal transition-all">
            <div class="space-y-2">
              <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-30' : ''">
                <span class="text-2xl">{{ teamFlag(m.homeTeamId) }}</span>
                <span class="font-bold text-sm flex-1 mx-2 truncate">{{ teamName(m.homeTeamId) }}</span>
                <span class="font-display text-xl">{{ m.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="h-px bg-wc-green"></div>
              <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-30' : ''">
                <span class="text-2xl">{{ teamFlag(m.awayTeamId) }}</span>
                <span class="font-bold text-sm flex-1 mx-2 truncate">{{ teamName(m.awayTeamId) }}</span>
                <span class="font-display text-xl">{{ m.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 中央决赛区 -->
        <div class="space-y-10">
          <!-- 左SF -->
          <div v-if="leftSF" class="bg-wc-blue/10 border-2 border-wc-blue p-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between" :class="isEliminated(leftSF, 'home') ? 'opacity-30' : ''">
                <span class="text-3xl">{{ teamFlag(leftSF.homeTeamId) }}</span>
                <span class="font-bold flex-1 mx-2 truncate">{{ teamName(leftSF.homeTeamId) }}</span>
                <span class="font-display text-2xl">{{ leftSF.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="h-px bg-wc-blue"></div>
              <div class="flex items-center justify-between" :class="isEliminated(leftSF, 'away') ? 'opacity-30' : ''">
                <span class="text-3xl">{{ teamFlag(leftSF.awayTeamId) }}</span>
                <span class="font-bold flex-1 mx-2 truncate">{{ teamName(leftSF.awayTeamId) }}</span>
                <span class="font-display text-2xl">{{ leftSF.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 决赛 -->
          <div v-if="final" class="relative bg-wc-gold border-4 border-black p-6 shadow-stadium">
            <div class="trophy-line mb-4"></div>
            <div class="text-center mb-5">
              <div class="text-7xl mb-2">🏆</div>
              <div class="font-display text-3xl uppercase tracking-tight">FINAL 决赛</div>
            </div>
            <div class="space-y-4">
              <div class="bg-white border-2 border-black p-4"
                :class="isEliminated(final, 'home') ? 'opacity-40' : isWinner(final, 'home') ? 'ring-4 ring-wc-gold' : ''">
                <div class="flex items-center justify-between">
                  <span class="text-4xl">{{ teamFlag(final.homeTeamId) }}</span>
                  <span class="font-bold text-lg flex-1 mx-3 truncate">{{ teamName(final.homeTeamId) }}</span>
                  <span class="font-display text-4xl">{{ final.result?.homeScore ?? '-' }}</span>
                </div>
              </div>
              <div class="bg-white border-2 border-black p-4"
                :class="isEliminated(final, 'away') ? 'opacity-40' : isWinner(final, 'away') ? 'ring-4 ring-wc-gold' : ''">
                <div class="flex items-center justify-between">
                  <span class="text-4xl">{{ teamFlag(final.awayTeamId) }}</span>
                  <span class="font-bold text-lg flex-1 mx-3 truncate">{{ teamName(final.awayTeamId) }}</span>
                  <span class="font-display text-4xl">{{ final.result?.awayScore ?? '-' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右SF -->
          <div v-if="rightSF" class="bg-wc-blue/10 border-2 border-wc-blue p-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between" :class="isEliminated(rightSF, 'home') ? 'opacity-30' : ''">
                <span class="text-3xl">{{ teamFlag(rightSF.homeTeamId) }}</span>
                <span class="font-bold flex-1 mx-2 truncate">{{ teamName(rightSF.homeTeamId) }}</span>
                <span class="font-display text-2xl">{{ rightSF.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="h-px bg-wc-blue"></div>
              <div class="flex items-center justify-between" :class="isEliminated(rightSF, 'away') ? 'opacity-30' : ''">
                <span class="text-3xl">{{ teamFlag(rightSF.awayTeamId) }}</span>
                <span class="font-bold flex-1 mx-2 truncate">{{ teamName(rightSF.awayTeamId) }}</span>
                <span class="font-display text-2xl">{{ rightSF.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧 QF -->
        <div class="space-y-24">
          <div v-for="m in rightQF" :key="m.id"
            class="bg-wc-green/10 border-2 border-wc-green p-4 hover:shadow-brutal transition-all">
            <div class="space-y-2">
              <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-30' : ''">
                <span class="text-2xl">{{ teamFlag(m.homeTeamId) }}</span>
                <span class="font-bold text-sm flex-1 mx-2 truncate">{{ teamName(m.homeTeamId) }}</span>
                <span class="font-display text-xl">{{ m.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="h-px bg-wc-green"></div>
              <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-30' : ''">
                <span class="text-2xl">{{ teamFlag(m.awayTeamId) }}</span>
                <span class="font-bold text-sm flex-1 mx-2 truncate">{{ teamName(m.awayTeamId) }}</span>
                <span class="font-display text-xl">{{ m.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧 R16 -->
        <div class="space-y-6">
          <div v-for="(m, idx) in rightR16" :key="m.id"
            class="bg-white border-2 border-black p-3 hover:shadow-brutal transition-all"
            :class="idx % 2 === 0 ? '' : 'mt-16'">
            <div class="absolute top-0 left-0 w-1 h-full bg-wc-green"></div>
            <div class="space-y-2">
              <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-30' : ''">
                <span class="text-2xl">{{ teamFlag(m.homeTeamId) }}</span>
                <span class="font-bold text-sm flex-1 mx-2 truncate">{{ teamName(m.homeTeamId) }}</span>
                <span class="font-display text-xl">{{ m.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="h-px bg-black"></div>
              <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-30' : ''">
                <span class="text-2xl">{{ teamFlag(m.awayTeamId) }}</span>
                <span class="font-bold text-sm flex-1 mx-2 truncate">{{ teamName(m.awayTeamId) }}</span>
                <span class="font-display text-xl">{{ m.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
