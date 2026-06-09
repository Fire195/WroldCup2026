<script setup lang="ts">
import type { Match, MatchStage } from '~/types'
import { useTeamStore } from '~/stores/teamStore'
import TeamFlag from './TeamFlag.vue'

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

const mobileActiveStage = ref<MatchStage>('r16')
const mobileStages = [
  { key: 'r16' as MatchStage, label: '16强', emoji: '⚔️' },
  { key: 'qf' as MatchStage, label: '8强', emoji: '🎯' },
  { key: 'sf' as MatchStage, label: '半决赛', emoji: '🔥' },
  { key: 'final' as MatchStage, label: '决赛', emoji: '🏆' },
]

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

function isPathActive(match?: Match): boolean {
  return match?.status === 'ended' && getWinner(match) !== null
}
</script>

<template>
  <div class="w-full">
    <!-- 移动端 -->
    <div class="md:hidden space-y-4 px-4">
      <!-- Stage Tabs -->
      <div class="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        <button
          v-for="stage in mobileStages"
          :key="stage.key"
          class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all"
          :class="mobileActiveStage === stage.key
            ? 'bg-wc-blue text-white shadow-md'
            : 'bg-stone-100 dark:bg-gray-800 text-stone-700 dark:text-gray-300 hover:bg-stone-200 dark:hover:bg-gray-700'"
          @click="mobileActiveStage = stage.key">
          <span>{{ stage.emoji }}</span>
          <span>{{ stage.label }}</span>
        </button>
      </div>

      <!-- Matches for selected stage -->
      <div class="space-y-3">
        <div
          v-for="m in props.bracket[mobileActiveStage]"
          :key="m.id"
          class="card-refined p-4"
          :class="mobileActiveStage === 'final' ? 'bg-gradient-to-br from-wc-gold/20 to-wc-gold/10' : ''">
          <div class="space-y-3">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 transition-all"
              :class="isEliminated(m, 'home') ? 'opacity-40' : isWinner(m, 'home') ? 'ring-2 ring-wc-gold' : ''">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <TeamFlag :team-id="m.homeTeamId" size="lg" />
                  <span class="font-semibold truncate dark:text-gray-100">{{ teamName(m.homeTeamId) }}</span>
                </div>
                <span class="font-bold text-2xl tabular-nums ml-3 dark:text-gray-100">{{ m.result?.homeScore ?? '-' }}</span>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 transition-all"
              :class="isEliminated(m, 'away') ? 'opacity-40' : isWinner(m, 'away') ? 'ring-2 ring-wc-gold' : ''">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <TeamFlag :team-id="m.awayTeamId" size="lg" />
                  <span class="font-semibold truncate dark:text-gray-100">{{ teamName(m.awayTeamId) }}</span>
                </div>
                <span class="font-bold text-2xl tabular-nums ml-3 dark:text-gray-100">{{ m.result?.awayScore ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="!props.bracket[mobileActiveStage] || props.bracket[mobileActiveStage].length === 0"
          class="card-refined p-8 text-center text-stone-500 dark:text-gray-400">
          <div class="text-4xl mb-2">{{ mobileStages.find(s => s.key === mobileActiveStage)?.emoji }}</div>
          <p class="text-sm">{{ mobileStages.find(s => s.key === mobileActiveStage)?.label }} 对阵待定</p>
        </div>
      </div>
    </div>

    <!-- 桌面端 -->
    <div class="hidden md:block py-8 px-6 overflow-x-auto">
      <div class="min-w-[1280px] flex items-stretch justify-center" style="height: 760px;">
        <!-- 左侧 R16: 分上下两组，每组 380px -->
        <div class="flex flex-col" style="width: 200px;">
          <div class="flex flex-col justify-around" style="height: 380px;">
            <div v-for="m in leftR16.slice(0, 2)" :key="m.id" class="card-refined p-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="m.homeTeamId" size="md" />
                  <span class="font-semibold text-xs flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(m.homeTeamId) }}</span>
                  <span class="font-bold tabular-nums dark:text-gray-100">{{ m.result?.homeScore ?? '-' }}</span>
                </div>
                <div class="h-px bg-stone-200 dark:bg-gray-700"></div>
                <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="m.awayTeamId" size="md" />
                  <span class="font-semibold text-xs flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(m.awayTeamId) }}</span>
                  <span class="font-bold tabular-nums dark:text-gray-100">{{ m.result?.awayScore ?? '-' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col justify-around" style="height: 380px;">
            <div v-for="m in leftR16.slice(2, 4)" :key="m.id" class="card-refined p-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="m.homeTeamId" size="md" />
                  <span class="font-semibold text-xs flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(m.homeTeamId) }}</span>
                  <span class="font-bold tabular-nums dark:text-gray-100">{{ m.result?.homeScore ?? '-' }}</span>
                </div>
                <div class="h-px bg-stone-200 dark:bg-gray-700"></div>
                <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="m.awayTeamId" size="md" />
                  <span class="font-semibold text-xs flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(m.awayTeamId) }}</span>
                  <span class="font-bold tabular-nums dark:text-gray-100">{{ m.result?.awayScore ?? '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 连线 R16→QF 左 -->
        <div class="flex flex-col" style="width: 40px;">
          <div class="relative" style="height: 380px;">
            <div class="absolute right-0 left-0 h-0.5" style="top: 25%;"
              :class="isPathActive(leftR16[0]) ? 'bg-wc-gold' : 'bg-stone-300'"></div>
            <div class="absolute right-0 left-0 h-0.5" style="top: 75%;"
              :class="isPathActive(leftR16[1]) ? 'bg-wc-gold' : 'bg-stone-300'"></div>
            <div class="absolute right-0 w-0.5" style="top: 25%; height: 50%;"
              :class="isPathActive(leftQF[0]) ? 'bg-wc-gold' : 'bg-stone-300'"></div>
          </div>
          <div class="relative" style="height: 380px;">
            <div class="absolute right-0 left-0 h-0.5" style="top: 25%;"
              :class="isPathActive(leftR16[2]) ? 'bg-wc-gold' : 'bg-stone-300'"></div>
            <div class="absolute right-0 left-0 h-0.5" style="top: 75%;"
              :class="isPathActive(leftR16[3]) ? 'bg-wc-gold' : 'bg-stone-300'"></div>
            <div class="absolute right-0 w-0.5" style="top: 25%; height: 50%;"
              :class="isPathActive(leftQF[1]) ? 'bg-wc-gold' : 'bg-stone-300'"></div>
          </div>
        </div>

        <!-- 左侧 QF -->
        <div class="flex flex-col" style="width: 200px;">
          <div class="flex items-center justify-center" style="height: 380px;">
            <div v-if="leftQF[0]" class="card-refined p-4 bg-wc-green/5 dark:bg-wc-green/10 w-full">
              <div class="space-y-2">
                <div class="flex items-center justify-between" :class="isEliminated(leftQF[0], 'home') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="leftQF[0].homeTeamId" size="md" />
                  <span class="font-semibold text-sm flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(leftQF[0].homeTeamId) }}</span>
                  <span class="font-bold text-lg tabular-nums dark:text-gray-100">{{ leftQF[0].result?.homeScore ?? '-' }}</span>
                </div>
                <div class="h-px bg-wc-green/30"></div>
                <div class="flex items-center justify-between" :class="isEliminated(leftQF[0], 'away') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="leftQF[0].awayTeamId" size="md" />
                  <span class="font-semibold text-sm flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(leftQF[0].awayTeamId) }}</span>
                  <span class="font-bold text-lg tabular-nums dark:text-gray-100">{{ leftQF[0].result?.awayScore ?? '-' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-center" style="height: 380px;">
            <div v-if="leftQF[1]" class="card-refined p-4 bg-wc-green/5 dark:bg-wc-green/10 w-full">
              <div class="space-y-2">
                <div class="flex items-center justify-between" :class="isEliminated(leftQF[1], 'home') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="leftQF[1].homeTeamId" size="md" />
                  <span class="font-semibold text-sm flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(leftQF[1].homeTeamId) }}</span>
                  <span class="font-bold text-lg tabular-nums dark:text-gray-100">{{ leftQF[1].result?.homeScore ?? '-' }}</span>
                </div>
                <div class="h-px bg-wc-green/30"></div>
                <div class="flex items-center justify-between" :class="isEliminated(leftQF[1], 'away') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="leftQF[1].awayTeamId" size="md" />
                  <span class="font-semibold text-sm flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(leftQF[1].awayTeamId) }}</span>
                  <span class="font-bold text-lg tabular-nums dark:text-gray-100">{{ leftQF[1].result?.awayScore ?? '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 连线 QF→SF 左 -->
        <div class="relative" style="width: 40px;">
          <div class="absolute right-0 left-0 h-0.5" style="top: 25%;"
            :class="isPathActive(leftQF[0]) ? 'bg-wc-blue' : 'bg-stone-300'"></div>
          <div class="absolute right-0 left-0 h-0.5" style="top: 75%;"
            :class="isPathActive(leftQF[1]) ? 'bg-wc-blue' : 'bg-stone-300'"></div>
          <div class="absolute right-0 w-0.5" style="top: 25%; height: 50%;"
            :class="isPathActive(leftSF) ? 'bg-wc-blue' : 'bg-stone-300'"></div>
        </div>

        <!-- 中央：左SF / 决赛 / 右SF -->
        <div class="flex flex-col" style="width: 280px;">
          <div class="flex items-center" style="height: 25%;">
            <div v-if="leftSF" class="card-refined p-4 bg-wc-blue/5 dark:bg-wc-blue/10 w-full">
              <div class="space-y-2">
                <div class="flex items-center justify-between" :class="isEliminated(leftSF, 'home') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="leftSF.homeTeamId" size="md" />
                  <span class="font-bold text-sm flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(leftSF.homeTeamId) }}</span>
                  <span class="font-bold tabular-nums dark:text-gray-100">{{ leftSF.result?.homeScore ?? '-' }}</span>
                </div>
                <div class="h-px bg-wc-blue/30"></div>
                <div class="flex items-center justify-between" :class="isEliminated(leftSF, 'away') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="leftSF.awayTeamId" size="md" />
                  <span class="font-bold text-sm flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(leftSF.awayTeamId) }}</span>
                  <span class="font-bold tabular-nums dark:text-gray-100">{{ leftSF.result?.awayScore ?? '-' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-center" style="height: 50%;">
            <div v-if="final" class="rounded-3xl p-5 bg-gradient-to-br from-wc-gold/30 to-wc-gold/10 w-full" style="box-shadow: 0 8px 40px rgba(212, 175, 55, 0.3);">
              <div class="text-center mb-3">
                <div class="text-5xl mb-1">🏆</div>
                <div class="font-bold text-xl text-stone-900 dark:text-gray-100">决赛</div>
                <div class="text-[10px] text-stone-600 dark:text-gray-400 font-medium">FINAL</div>
              </div>
              <div class="space-y-2">
                <div class="bg-white dark:bg-gray-900 rounded-xl p-3 transition-all"
                  :class="isEliminated(final, 'home') ? 'opacity-40' : isWinner(final, 'home') ? 'ring-2 ring-wc-gold' : ''">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <TeamFlag :team-id="final.homeTeamId" size="md" />
                      <span class="font-bold text-sm truncate dark:text-gray-100">{{ teamName(final.homeTeamId) }}</span>
                    </div>
                    <span class="font-bold text-2xl tabular-nums dark:text-gray-100">{{ final.result?.homeScore ?? '-' }}</span>
                  </div>
                </div>
                <div class="bg-white dark:bg-gray-900 rounded-xl p-3 transition-all"
                  :class="isEliminated(final, 'away') ? 'opacity-40' : isWinner(final, 'away') ? 'ring-2 ring-wc-gold' : ''">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <TeamFlag :team-id="final.awayTeamId" size="md" />
                      <span class="font-bold text-sm truncate dark:text-gray-100">{{ teamName(final.awayTeamId) }}</span>
                    </div>
                    <span class="font-bold text-2xl tabular-nums dark:text-gray-100">{{ final.result?.awayScore ?? '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center" style="height: 25%;">
            <div v-if="rightSF" class="card-refined p-4 bg-wc-blue/5 dark:bg-wc-blue/10 w-full">
              <div class="space-y-2">
                <div class="flex items-center justify-between" :class="isEliminated(rightSF, 'home') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="rightSF.homeTeamId" size="md" />
                  <span class="font-bold text-sm flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(rightSF.homeTeamId) }}</span>
                  <span class="font-bold tabular-nums dark:text-gray-100">{{ rightSF.result?.homeScore ?? '-' }}</span>
                </div>
                <div class="h-px bg-wc-blue/30"></div>
                <div class="flex items-center justify-between" :class="isEliminated(rightSF, 'away') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="rightSF.awayTeamId" size="md" />
                  <span class="font-bold text-sm flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(rightSF.awayTeamId) }}</span>
                  <span class="font-bold tabular-nums dark:text-gray-100">{{ rightSF.result?.awayScore ?? '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 连线 QF→SF 右 -->
        <div class="relative" style="width: 40px;">
          <div class="absolute right-0 left-0 h-0.5" style="top: 25%;"
            :class="isPathActive(rightQF[0]) ? 'bg-wc-blue' : 'bg-stone-300'"></div>
          <div class="absolute right-0 left-0 h-0.5" style="top: 75%;"
            :class="isPathActive(rightQF[1]) ? 'bg-wc-blue' : 'bg-stone-300'"></div>
          <div class="absolute left-0 w-0.5" style="top: 25%; height: 50%;"
            :class="isPathActive(rightSF) ? 'bg-wc-blue' : 'bg-stone-300'"></div>
        </div>

        <!-- 右侧 QF -->
        <div class="flex flex-col" style="width: 200px;">
          <div class="flex items-center justify-center" style="height: 380px;">
            <div v-if="rightQF[0]" class="card-refined p-4 bg-wc-green/5 dark:bg-wc-green/10 w-full">
              <div class="space-y-2">
                <div class="flex items-center justify-between" :class="isEliminated(rightQF[0], 'home') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="rightQF[0].homeTeamId" size="md" />
                  <span class="font-semibold text-sm flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(rightQF[0].homeTeamId) }}</span>
                  <span class="font-bold text-lg tabular-nums dark:text-gray-100">{{ rightQF[0].result?.homeScore ?? '-' }}</span>
                </div>
                <div class="h-px bg-wc-green/30"></div>
                <div class="flex items-center justify-between" :class="isEliminated(rightQF[0], 'away') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="rightQF[0].awayTeamId" size="md" />
                  <span class="font-semibold text-sm flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(rightQF[0].awayTeamId) }}</span>
                  <span class="font-bold text-lg tabular-nums dark:text-gray-100">{{ rightQF[0].result?.awayScore ?? '-' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-center" style="height: 380px;">
            <div v-if="rightQF[1]" class="card-refined p-4 bg-wc-green/5 dark:bg-wc-green/10 w-full">
              <div class="space-y-2">
                <div class="flex items-center justify-between" :class="isEliminated(rightQF[1], 'home') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="rightQF[1].homeTeamId" size="md" />
                  <span class="font-semibold text-sm flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(rightQF[1].homeTeamId) }}</span>
                  <span class="font-bold text-lg tabular-nums dark:text-gray-100">{{ rightQF[1].result?.homeScore ?? '-' }}</span>
                </div>
                <div class="h-px bg-wc-green/30"></div>
                <div class="flex items-center justify-between" :class="isEliminated(rightQF[1], 'away') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="rightQF[1].awayTeamId" size="md" />
                  <span class="font-semibold text-sm flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(rightQF[1].awayTeamId) }}</span>
                  <span class="font-bold text-lg tabular-nums dark:text-gray-100">{{ rightQF[1].result?.awayScore ?? '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 连线 R16→QF 右 -->
        <div class="flex flex-col" style="width: 40px;">
          <div class="relative" style="height: 380px;">
            <div class="absolute right-0 left-0 h-0.5" style="top: 25%;"
              :class="isPathActive(rightR16[0]) ? 'bg-wc-gold' : 'bg-stone-300'"></div>
            <div class="absolute right-0 left-0 h-0.5" style="top: 75%;"
              :class="isPathActive(rightR16[1]) ? 'bg-wc-gold' : 'bg-stone-300'"></div>
            <div class="absolute left-0 w-0.5" style="top: 25%; height: 50%;"
              :class="isPathActive(rightQF[0]) ? 'bg-wc-gold' : 'bg-stone-300'"></div>
          </div>
          <div class="relative" style="height: 380px;">
            <div class="absolute right-0 left-0 h-0.5" style="top: 25%;"
              :class="isPathActive(rightR16[2]) ? 'bg-wc-gold' : 'bg-stone-300'"></div>
            <div class="absolute right-0 left-0 h-0.5" style="top: 75%;"
              :class="isPathActive(rightR16[3]) ? 'bg-wc-gold' : 'bg-stone-300'"></div>
            <div class="absolute left-0 w-0.5" style="top: 25%; height: 50%;"
              :class="isPathActive(rightQF[1]) ? 'bg-wc-gold' : 'bg-stone-300'"></div>
          </div>
        </div>

        <!-- 右侧 R16 -->
        <div class="flex flex-col" style="width: 200px;">
          <div class="flex flex-col justify-around" style="height: 380px;">
            <div v-for="m in rightR16.slice(0, 2)" :key="m.id" class="card-refined p-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="m.homeTeamId" size="md" />
                  <span class="font-semibold text-xs flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(m.homeTeamId) }}</span>
                  <span class="font-bold tabular-nums dark:text-gray-100">{{ m.result?.homeScore ?? '-' }}</span>
                </div>
                <div class="h-px bg-stone-200 dark:bg-gray-700"></div>
                <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="m.awayTeamId" size="md" />
                  <span class="font-semibold text-xs flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(m.awayTeamId) }}</span>
                  <span class="font-bold tabular-nums dark:text-gray-100">{{ m.result?.awayScore ?? '-' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col justify-around" style="height: 380px;">
            <div v-for="m in rightR16.slice(2, 4)" :key="m.id" class="card-refined p-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between" :class="isEliminated(m, 'home') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="m.homeTeamId" size="md" />
                  <span class="font-semibold text-xs flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(m.homeTeamId) }}</span>
                  <span class="font-bold tabular-nums dark:text-gray-100">{{ m.result?.homeScore ?? '-' }}</span>
                </div>
                <div class="h-px bg-stone-200 dark:bg-gray-700"></div>
                <div class="flex items-center justify-between" :class="isEliminated(m, 'away') ? 'opacity-30' : ''">
                  <TeamFlag :team-id="m.awayTeamId" size="md" />
                  <span class="font-semibold text-xs flex-1 mx-2 truncate dark:text-gray-100">{{ teamName(m.awayTeamId) }}</span>
                  <span class="font-bold tabular-nums dark:text-gray-100">{{ m.result?.awayScore ?? '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
