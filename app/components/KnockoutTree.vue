<script setup lang="ts">
import type { Match, MatchStage } from '~/types'
import { useTeamStore } from '~/stores/teamStore'

const props = defineProps<{ bracket: Record<MatchStage, Match[]> }>()
const teams = useTeamStore()

// 左侧半区（上半部分）：R16 的前 8 场 → QF 前 2 场 → SF 第 1 场
const leftR16 = computed(() => props.bracket.r16?.slice(0, 4) || [])
const leftQF = computed(() => props.bracket.qf?.slice(0, 2) || [])
const leftSF = computed(() => props.bracket.sf?.[0])

// 右侧半区（下半部分）：R16 的后 8 场 → QF 后 2 场 → SF 第 2 场
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
</script>

<template>
  <div class="w-full overflow-x-auto">
    <!-- 移动端：简化的列表视图 -->
    <div class="md:hidden space-y-4">
      <div v-if="leftR16.length" class="space-y-2">
        <h3 class="font-semibold text-sm text-gray-500">16 强赛（左半区）</h3>
        <div v-for="m in leftR16" :key="m.id" class="rounded-lg border border-gray-200 dark:border-gray-800 p-3 text-sm">
          <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-40' : ''">
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ teamFlag(m.homeTeamId) }}</span>
              <span>{{ teamName(m.homeTeamId) }}</span>
            </div>
            <span class="tabular-nums font-bold">{{ m.result?.homeScore ?? '-' }}</span>
          </div>
          <div class="flex items-center justify-between mt-2" :class="isEliminated(m, 'away') ? 'opacity-40' : ''">
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ teamFlag(m.awayTeamId) }}</span>
              <span>{{ teamName(m.awayTeamId) }}</span>
            </div>
            <span class="tabular-nums font-bold">{{ m.result?.awayScore ?? '-' }}</span>
          </div>
        </div>
      </div>

      <div v-if="rightR16.length" class="space-y-2">
        <h3 class="font-semibold text-sm text-gray-500">16 强赛（右半区）</h3>
        <div v-for="m in rightR16" :key="m.id" class="rounded-lg border border-gray-200 dark:border-gray-800 p-3 text-sm">
          <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-40' : ''">
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ teamFlag(m.homeTeamId) }}</span>
              <span>{{ teamName(m.homeTeamId) }}</span>
            </div>
            <span class="tabular-nums font-bold">{{ m.result?.homeScore ?? '-' }}</span>
          </div>
          <div class="flex items-center justify-between mt-2" :class="isEliminated(m, 'away') ? 'opacity-40' : ''">
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ teamFlag(m.awayTeamId) }}</span>
              <span>{{ teamName(m.awayTeamId) }}</span>
            </div>
            <span class="tabular-nums font-bold">{{ m.result?.awayScore ?? '-' }}</span>
          </div>
        </div>
      </div>

      <div v-if="final" class="rounded-xl bg-gradient-to-br from-brand to-brand-accent p-4 text-white">
        <h3 class="text-center font-bold text-sm mb-3">决赛</h3>
        <div class="space-y-2">
          <div class="flex items-center justify-between" :class="isEliminated(final, 'home') ? 'opacity-60' : ''">
            <div class="flex items-center gap-2">
              <span class="text-2xl">{{ teamFlag(final.homeTeamId) }}</span>
              <span class="font-semibold">{{ teamName(final.homeTeamId) }}</span>
            </div>
            <span class="tabular-nums font-bold text-xl">{{ final.result?.homeScore ?? '-' }}</span>
          </div>
          <div class="flex items-center justify-between" :class="isEliminated(final, 'away') ? 'opacity-60' : ''">
            <div class="flex items-center gap-2">
              <span class="text-2xl">{{ teamFlag(final.awayTeamId) }}</span>
              <span class="font-semibold">{{ teamName(final.awayTeamId) }}</span>
            </div>
            <span class="tabular-nums font-bold text-xl">{{ final.result?.awayScore ?? '-' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 桌面端：对称树状结构 -->
    <div class="hidden md:block min-w-[1200px] py-8">
      <div class="grid grid-cols-[1fr_1fr_1.5fr_1fr_1fr] gap-6 items-center">
        <!-- 左侧 R16 -->
        <div class="space-y-6">
          <div v-for="(m, idx) in leftR16" :key="m.id"
            class="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
            :class="idx % 2 === 0 ? '' : 'mt-16'">
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-40' : ''">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span class="text-2xl flex-shrink-0">{{ teamFlag(m.homeTeamId) }}</span>
                  <span class="truncate font-medium">{{ teamName(m.homeTeamId) }}</span>
                </div>
                <span class="tabular-nums font-bold ml-2">{{ m.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-40' : ''">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span class="text-2xl flex-shrink-0">{{ teamFlag(m.awayTeamId) }}</span>
                  <span class="truncate font-medium">{{ teamName(m.awayTeamId) }}</span>
                </div>
                <span class="tabular-nums font-bold ml-2">{{ m.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 左侧 QF -->
        <div class="space-y-20">
          <div v-for="m in leftQF" :key="m.id"
            class="rounded-lg border-2 border-blue-400 dark:border-blue-600 bg-white dark:bg-gray-900 p-3">
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-40' : ''">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span class="text-2xl flex-shrink-0">{{ teamFlag(m.homeTeamId) }}</span>
                  <span class="truncate font-medium">{{ teamName(m.homeTeamId) }}</span>
                </div>
                <span class="tabular-nums font-bold ml-2">{{ m.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-40' : ''">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span class="text-2xl flex-shrink-0">{{ teamFlag(m.awayTeamId) }}</span>
                  <span class="truncate font-medium">{{ teamName(m.awayTeamId) }}</span>
                </div>
                <span class="tabular-nums font-bold ml-2">{{ m.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 中央决赛区 -->
        <div class="space-y-8">
          <!-- 左侧 SF -->
          <div v-if="leftSF"
            class="rounded-lg border-2 border-purple-400 dark:border-purple-600 bg-white dark:bg-gray-900 p-3">
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between" :class="isEliminated(leftSF, 'home') ? 'opacity-40' : ''">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span class="text-2xl flex-shrink-0">{{ teamFlag(leftSF.homeTeamId) }}</span>
                  <span class="truncate font-medium">{{ teamName(leftSF.homeTeamId) }}</span>
                </div>
                <span class="tabular-nums font-bold ml-2">{{ leftSF.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="flex items-center justify-between" :class="isEliminated(leftSF, 'away') ? 'opacity-40' : ''">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span class="text-2xl flex-shrink-0">{{ teamFlag(leftSF.awayTeamId) }}</span>
                  <span class="truncate font-medium">{{ teamName(leftSF.awayTeamId) }}</span>
                </div>
                <span class="tabular-nums font-bold ml-2">{{ leftSF.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 决赛 -->
          <div v-if="final"
            class="rounded-xl border-4 border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/30 p-5 shadow-xl">
            <div class="text-center mb-3">
              <div class="text-xs uppercase font-bold text-yellow-700 dark:text-yellow-400">决赛</div>
              <div class="text-xl font-black text-yellow-900 dark:text-yellow-200 mt-1">🏆 FINAL</div>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-gray-900/60"
                :class="isEliminated(final, 'home') ? 'opacity-50' : 'ring-2 ring-yellow-400'">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-3xl flex-shrink-0">{{ teamFlag(final.homeTeamId) }}</span>
                  <span class="font-bold text-lg truncate">{{ teamName(final.homeTeamId) }}</span>
                </div>
                <span class="tabular-nums font-black text-2xl ml-3">{{ final.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-gray-900/60"
                :class="isEliminated(final, 'away') ? 'opacity-50' : 'ring-2 ring-yellow-400'">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-3xl flex-shrink-0">{{ teamFlag(final.awayTeamId) }}</span>
                  <span class="font-bold text-lg truncate">{{ teamName(final.awayTeamId) }}</span>
                </div>
                <span class="tabular-nums font-black text-2xl ml-3">{{ final.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 右侧 SF -->
          <div v-if="rightSF"
            class="rounded-lg border-2 border-purple-400 dark:border-purple-600 bg-white dark:bg-gray-900 p-3">
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between" :class="isEliminated(rightSF, 'home') ? 'opacity-40' : ''">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span class="text-2xl flex-shrink-0">{{ teamFlag(rightSF.homeTeamId) }}</span>
                  <span class="truncate font-medium">{{ teamName(rightSF.homeTeamId) }}</span>
                </div>
                <span class="tabular-nums font-bold ml-2">{{ rightSF.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="flex items-center justify-between" :class="isEliminated(rightSF, 'away') ? 'opacity-40' : ''">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span class="text-2xl flex-shrink-0">{{ teamFlag(rightSF.awayTeamId) }}</span>
                  <span class="truncate font-medium">{{ teamName(rightSF.awayTeamId) }}</span>
                </div>
                <span class="tabular-nums font-bold ml-2">{{ rightSF.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧 QF -->
        <div class="space-y-20">
          <div v-for="m in rightQF" :key="m.id"
            class="rounded-lg border-2 border-blue-400 dark:border-blue-600 bg-white dark:bg-gray-900 p-3">
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-40' : ''">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span class="text-2xl flex-shrink-0">{{ teamFlag(m.homeTeamId) }}</span>
                  <span class="truncate font-medium">{{ teamName(m.homeTeamId) }}</span>
                </div>
                <span class="tabular-nums font-bold ml-2">{{ m.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-40' : ''">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span class="text-2xl flex-shrink-0">{{ teamFlag(m.awayTeamId) }}</span>
                  <span class="truncate font-medium">{{ teamName(m.awayTeamId) }}</span>
                </div>
                <span class="tabular-nums font-bold ml-2">{{ m.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧 R16 -->
        <div class="space-y-6">
          <div v-for="(m, idx) in rightR16" :key="m.id"
            class="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
            :class="idx % 2 === 0 ? '' : 'mt-16'">
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-40' : ''">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span class="text-2xl flex-shrink-0">{{ teamFlag(m.homeTeamId) }}</span>
                  <span class="truncate font-medium">{{ teamName(m.homeTeamId) }}</span>
                </div>
                <span class="tabular-nums font-bold ml-2">{{ m.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-40' : ''">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span class="text-2xl flex-shrink-0">{{ teamFlag(m.awayTeamId) }}</span>
                  <span class="truncate font-medium">{{ teamName(m.awayTeamId) }}</span>
                </div>
                <span class="tabular-nums font-bold ml-2">{{ m.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
