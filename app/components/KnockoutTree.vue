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
  <div class="w-full overflow-x-auto">
    <!-- 移动端视图 -->
    <div class="md:hidden space-y-4">
      <div v-if="final" class="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 shadow-2xl">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div class="relative">
          <div class="text-center mb-4">
            <div class="text-6xl mb-2 animate-bounce">🏆</div>
            <div class="text-sm font-bold text-yellow-900 uppercase tracking-widest">决赛 · FINAL</div>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 rounded-xl backdrop-blur-sm"
              :class="isEliminated(final, 'home') ? 'bg-black/20 opacity-60' : 'bg-white/90 shadow-lg ring-4 ring-white/50'">
              <div class="flex items-center gap-3 flex-1">
                <span class="text-4xl">{{ teamFlag(final.homeTeamId) }}</span>
                <span class="font-black text-xl" :class="isWinner(final, 'home') ? 'text-yellow-900' : 'text-gray-700'">
                  {{ teamName(final.homeTeamId) }}
                </span>
              </div>
              <span class="text-3xl font-black tabular-nums" :class="isWinner(final, 'home') ? 'text-yellow-900' : 'text-gray-600'">
                {{ final.result?.homeScore ?? '-' }}
              </span>
            </div>
            <div class="flex items-center justify-between p-4 rounded-xl backdrop-blur-sm"
              :class="isEliminated(final, 'away') ? 'bg-black/20 opacity-60' : 'bg-white/90 shadow-lg ring-4 ring-white/50'">
              <div class="flex items-center gap-3 flex-1">
                <span class="text-4xl">{{ teamFlag(final.awayTeamId) }}</span>
                <span class="font-black text-xl" :class="isWinner(final, 'away') ? 'text-yellow-900' : 'text-gray-700'">
                  {{ teamName(final.awayTeamId) }}
                </span>
              </div>
              <span class="text-3xl font-black tabular-nums" :class="isWinner(final, 'away') ? 'text-yellow-900' : 'text-gray-600'">
                {{ final.result?.awayScore ?? '-' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div v-if="leftSF" class="rounded-xl p-3 bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
          <div class="text-xs font-bold mb-2 opacity-80">半决赛 1</div>
          <div class="space-y-2 text-sm">
            <div :class="isEliminated(leftSF, 'home') ? 'opacity-50' : ''">
              <span class="text-xl mr-1">{{ teamFlag(leftSF.homeTeamId) }}</span>
              <span class="font-bold text-xs">{{ m.result?.homeScore ?? '-' }}</span>
            </div>
            <div :class="isEliminated(leftSF, 'away') ? 'opacity-50' : ''">
              <span class="text-xl mr-1">{{ teamFlag(leftSF.awayTeamId) }}</span>
              <span class="font-bold">{{ leftSF.result?.awayScore ?? '-' }}</span>
            </div>
          </div>
        </div>
        <div v-if="rightSF" class="rounded-xl p-3 bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
          <div class="text-xs font-bold mb-2 opacity-80">半决赛 2</div>
          <div class="space-y-2 text-sm">
            <div :class="isEliminated(rightSF, 'home') ? 'opacity-50' : ''">
              <span class="text-xl mr-1">{{ teamFlag(rightSF.homeTeamId) }}</span>
              <span class="font-bold">{{ rightSF.result?.homeScore ?? '-' }}</span>
            </div>
            <div :class="isEliminated(rightSF, 'away') ? 'opacity-50' : ''">
              <span class="text-xl mr-1">{{ teamFlag(rightSF.awayTeamId) }}</span>
              <span class="font-bold">{{ rightSF.result?.awayScore ?? '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 桌面端：对称树状结构 with glassmorphism -->
    <div class="hidden md:block min-w-[1400px] py-12 px-6">
      <!-- 背景渐变 -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 -z-10"></div>

      <div class="grid grid-cols-[1fr_1fr_1.8fr_1fr_1fr] gap-8 items-center relative">
        <!-- 左侧 R16 -->
        <div class="space-y-8">
          <div v-for="(m, idx) in leftR16" :key="m.id"
            class="group relative backdrop-blur-md bg-white/70 dark:bg-gray-900/70 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/50 dark:border-gray-700/50"
            :class="idx % 2 === 0 ? '' : 'mt-20'">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
            <div class="relative space-y-3">
              <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-30' : ''">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-3xl drop-shadow-lg">{{ teamFlag(m.homeTeamId) }}</span>
                  <span class="font-bold truncate text-gray-900 dark:text-white">{{ teamName(m.homeTeamId) }}</span>
                </div>
                <span class="text-2xl font-black tabular-nums text-brand ml-3">{{ m.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
              <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-30' : ''">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-3xl drop-shadow-lg">{{ teamFlag(m.awayTeamId) }}</span>
                  <span class="font-bold truncate text-gray-900 dark:text-white">{{ teamName(m.awayTeamId) }}</span>
                </div>
                <span class="text-2xl font-black tabular-nums text-brand ml-3">{{ m.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 左侧 QF -->
        <div class="space-y-32">
          <div v-for="m in leftQF" :key="m.id"
            class="group relative backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-600/30 dark:to-purple-600/30 rounded-2xl p-4 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 border-2 border-blue-400/50">
            <div class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition duration-300"></div>
            <div class="relative space-y-3">
              <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-30' : ''">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-3xl drop-shadow-lg">{{ teamFlag(m.homeTeamId) }}</span>
                  <span class="font-bold truncate text-gray-900 dark:text-white">{{ teamName(m.homeTeamId) }}</span>
                </div>
                <span class="text-2xl font-black tabular-nums text-blue-600 dark:text-blue-400 ml-3">{{ m.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
              <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-30' : ''">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-3xl drop-shadow-lg">{{ teamFlag(m.awayTeamId) }}</span>
                  <span class="font-bold truncate text-gray-900 dark:text-white">{{ teamName(m.awayTeamId) }}</span>
                </div>
                <span class="text-2xl font-black tabular-nums text-blue-600 dark:text-blue-400 ml-3">{{ m.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 中央决赛区 -->
        <div class="space-y-12 px-4">
          <!-- 左侧 SF -->
          <div v-if="leftSF"
            class="group relative backdrop-blur-md bg-gradient-to-br from-purple-500/30 to-pink-500/30 dark:from-purple-600/40 dark:to-pink-600/40 rounded-2xl p-5 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 border-2 border-purple-400/60">
            <div class="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-30 group-hover:opacity-50 blur-xl transition duration-300"></div>
            <div class="relative space-y-3">
              <div class="flex items-center justify-between" :class="isEliminated(leftSF, 'home') ? 'opacity-30' : ''">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-4xl drop-shadow-lg">{{ teamFlag(leftSF.homeTeamId) }}</span>
                  <span class="font-bold text-lg truncate text-gray-900 dark:text-white">{{ teamName(leftSF.homeTeamId) }}</span>
                </div>
                <span class="text-3xl font-black tabular-nums text-purple-600 dark:text-purple-300 ml-3">{{ leftSF.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
              <div class="flex items-center justify-between" :class="isEliminated(leftSF, 'away') ? 'opacity-30' : ''">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-4xl drop-shadow-lg">{{ teamFlag(leftSF.awayTeamId) }}</span>
                  <span class="font-bold text-lg truncate text-gray-900 dark:text-white">{{ teamName(leftSF.awayTeamId) }}</span>
                </div>
                <span class="text-3xl font-black tabular-nums text-purple-600 dark:text-purple-300 ml-3">{{ leftSF.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 决赛 - 视觉焦点 -->
          <div v-if="final"
            class="group relative rounded-3xl p-8 shadow-2xl hover:shadow-yellow-500/50 transition-all duration-500 hover:scale-110 animate-pulse-slow">
            <!-- 发光背景 -->
            <div class="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-3xl opacity-75 blur-2xl animate-pulse"></div>
            <div class="absolute -inset-1 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 rounded-3xl"></div>

            <!-- 内容区 -->
            <div class="relative backdrop-blur-xl bg-gradient-to-br from-yellow-50/95 to-amber-100/95 dark:from-yellow-900/95 dark:to-amber-950/95 rounded-2xl p-6">
              <div class="text-center mb-5">
                <div class="text-7xl mb-3 animate-bounce inline-block drop-shadow-2xl">🏆</div>
                <div class="text-xs font-black text-yellow-800 dark:text-yellow-200 uppercase tracking-[0.3em] mb-1">决赛</div>
                <div class="text-3xl font-black bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent">
                  FINAL
                </div>
              </div>

              <div class="space-y-4">
                <div class="relative group/team">
                  <div class="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-xl opacity-0 group-hover/team:opacity-50 blur transition duration-300"
                    :class="isWinner(final, 'home') ? 'opacity-50' : ''"></div>
                  <div class="relative flex items-center justify-between p-4 rounded-xl transition-all duration-300"
                    :class="isEliminated(final, 'home') ? 'bg-gray-200/50 dark:bg-gray-800/50 opacity-40' : 'bg-white dark:bg-gray-900 shadow-xl ring-2 ring-yellow-400 hover:ring-4'">
                    <div class="flex items-center gap-4 flex-1 min-w-0">
                      <span class="text-5xl drop-shadow-2xl">{{ teamFlag(final.homeTeamId) }}</span>
                      <span class="font-black text-2xl truncate" :class="isWinner(final, 'home') ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-700 dark:text-gray-300'">
                        {{ teamName(final.homeTeamId) }}
                      </span>
                    </div>
                    <span class="text-5xl font-black tabular-nums ml-4" :class="isWinner(final, 'home') ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500'">
                      {{ final.result?.homeScore ?? '-' }}
                    </span>
                  </div>
                </div>

                <div class="h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full"></div>

                <div class="relative group/team">
                  <div class="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-xl opacity-0 group-hover/team:opacity-50 blur transition duration-300"
                    :class="isWinner(final, 'away') ? 'opacity-50' : ''"></div>
                  <div class="relative flex items-center justify-between p-4 rounded-xl transition-all duration-300"
                    :class="isEliminated(final, 'away') ? 'bg-gray-200/50 dark:bg-gray-800/50 opacity-40' : 'bg-white dark:bg-gray-900 shadow-xl ring-2 ring-yellow-400 hover:ring-4'">
                    <div class="flex items-center gap-4 flex-1 min-w-0">
                      <span class="text-5xl drop-shadow-2xl">{{ teamFlag(final.awayTeamId) }}</span>
                      <span class="font-black text-2xl truncate" :class="isWinner(final, 'away') ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-700 dark:text-gray-300'">
                        {{ teamName(final.awayTeamId) }}
                      </span>
                    </div>
                    <span class="text-5xl font-black tabular-nums ml-4" :class="isWinner(final, 'away') ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500'">
                      {{ final.result?.awayScore ?? '-' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧 SF -->
          <div v-if="rightSF"
            class="group relative backdrop-blur-md bg-gradient-to-br from-purple-500/30 to-pink-500/30 dark:from-purple-600/40 dark:to-pink-600/40 rounded-2xl p-5 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 border-2 border-purple-400/60">
            <div class="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl opacity-30 group-hover:opacity-50 blur-xl transition duration-300"></div>
            <div class="relative space-y-3">
              <div class="flex items-center justify-between" :class="isEliminated(rightSF, 'home') ? 'opacity-30' : ''">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-4xl drop-shadow-lg">{{ teamFlag(rightSF.homeTeamId) }}</span>
                  <span class="font-bold text-lg truncate text-gray-900 dark:text-white">{{ teamName(rightSF.homeTeamId) }}</span>
                </div>
                <span class="text-3xl font-black tabular-nums text-purple-600 dark:text-purple-300 ml-3">{{ rightSF.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
              <div class="flex items-center justify-between" :class="isEliminated(rightSF, 'away') ? 'opacity-30' : ''">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-4xl drop-shadow-lg">{{ teamFlag(rightSF.awayTeamId) }}</span>
                  <span class="font-bold text-lg truncate text-gray-900 dark:text-white">{{ teamName(rightSF.awayTeamId) }}</span>
                </div>
                <span class="text-3xl font-black tabular-nums text-purple-600 dark:text-purple-300 ml-3">{{ rightSF.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧 QF -->
        <div class="space-y-32">
          <div v-for="m in rightQF" :key="m.id"
            class="group relative backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-blue-500/20 dark:from-purple-600/30 dark:to-blue-600/30 rounded-2xl p-4 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 border-2 border-blue-400/50">
            <div class="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition duration-300"></div>
            <div class="relative space-y-3">
              <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-30' : ''">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-3xl drop-shadow-lg">{{ teamFlag(m.homeTeamId) }}</span>
                  <span class="font-bold truncate text-gray-900 dark:text-white">{{ teamName(m.homeTeamId) }}</span>
                </div>
                <span class="text-2xl font-black tabular-nums text-blue-600 dark:text-blue-400 ml-3">{{ m.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
              <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-30' : ''">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-3xl drop-shadow-lg">{{ teamFlag(m.awayTeamId) }}</span>
                  <span class="font-bold truncate text-gray-900 dark:text-white">{{ teamName(m.awayTeamId) }}</span>
                </div>
                <span class="text-2xl font-black tabular-nums text-blue-600 dark:text-blue-400 ml-3">{{ m.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧 R16 -->
        <div class="space-y-8">
          <div v-for="(m, idx) in rightR16" :key="m.id"
            class="group relative backdrop-blur-md bg-white/70 dark:bg-gray-900/70 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/50 dark:border-gray-700/50"
            :class="idx % 2 === 0 ? '' : 'mt-20'">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
            <div class="relative space-y-3">
              <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-30' : ''">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-3xl drop-shadow-lg">{{ teamFlag(m.homeTeamId) }}</span>
                  <span class="font-bold truncate text-gray-900 dark:text-white">{{ teamName(m.homeTeamId) }}</span>
                </div>
                <span class="text-2xl font-black tabular-nums text-brand ml-3">{{ m.result?.homeScore ?? '-' }}</span>
              </div>
              <div class="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
              <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-30' : ''">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-3xl drop-shadow-lg">{{ teamFlag(m.awayTeamId) }}</span>
                  <span class="font-bold truncate text-gray-900 dark:text-white">{{ teamName(m.awayTeamId) }}</span>
                </div>
                <span class="text-2xl font-black tabular-nums text-brand ml-3">{{ m.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
