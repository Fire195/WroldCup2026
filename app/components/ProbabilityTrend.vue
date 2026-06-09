<script setup lang="ts">
import { useTeamStore } from '~/stores/teamStore'

const props = defineProps<{
  teamIds: string[] // Top teams to show trends for
  maxLines?: number
}>()

const teams = useTeamStore()
const { data: history } = await useFetch<Record<string, Record<string, number>>>('/api/champion-rates-history')

const chartData = computed(() => {
  if (!history.value || Object.keys(history.value).length === 0) return null

  const dates = Object.keys(history.value).sort()
  if (dates.length === 0) return null

  const lines = props.teamIds.slice(0, props.maxLines ?? 5).map(teamId => {
    const points = dates.map(date => history.value![date]?.[teamId] ?? 0)
    return { teamId, points, team: teams.byId(teamId) }
  })

  const maxRate = Math.max(...lines.flatMap(l => l.points))

  return { dates, lines, maxRate }
})

const svgWidth = 200
const svgHeight = 40
const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function getPath(points: number[], maxRate: number): string {
  if (points.length === 0) return ''
  const xStep = svgWidth / Math.max(1, points.length - 1)
  const yScale = svgHeight / Math.max(1, maxRate)

  const pathPoints = points.map((y, i) => {
    const x = i * xStep
    const scaledY = svgHeight - y * yScale
    return `${x},${scaledY}`
  })

  return 'M' + pathPoints.join(' L')
}

function getTrend(points: number[]): 'up' | 'down' | 'flat' {
  if (points.length < 2) return 'flat'
  const first = points[0]
  const last = points[points.length - 1]
  const diff = last - first
  if (Math.abs(diff) < 0.5) return 'flat'
  return diff > 0 ? 'up' : 'down'
}
</script>

<template>
  <div v-if="chartData" class="card-refined p-5">
    <h3 class="font-semibold mb-4 text-sm dark:text-gray-100">夺冠概率走势</h3>

    <div class="space-y-3">
      <div v-for="(line, idx) in chartData.lines" :key="line.teamId" class="flex items-center gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-medium truncate dark:text-gray-200">{{ line.team?.name ?? line.teamId }}</span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded font-semibold"
              :class="{
                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': getTrend(line.points) === 'up',
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': getTrend(line.points) === 'down',
                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400': getTrend(line.points) === 'flat',
              }">
              {{ { up: '↗', down: '↘', flat: '→' }[getTrend(line.points)] }}
              {{ line.points[line.points.length - 1]?.toFixed(1) }}%
            </span>
          </div>
          <svg :width="svgWidth" :height="svgHeight" class="w-full" :viewBox="`0 0 ${svgWidth} ${svgHeight}`">
            <path
              :d="getPath(line.points, chartData.maxRate)"
              :stroke="colors[idx % colors.length]"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>

    <p v-if="chartData.dates.length > 0" class="text-[10px] text-stone-500 dark:text-gray-400 mt-3 text-right">
      {{ chartData.dates[0] }} ~ {{ chartData.dates[chartData.dates.length - 1] }}
    </p>
  </div>

  <div v-else class="card-refined p-8 text-center">
    <p class="text-sm text-stone-500 dark:text-gray-400">赛事开始后将显示走势图</p>
  </div>
</template>
