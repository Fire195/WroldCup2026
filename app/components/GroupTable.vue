<script setup lang="ts">
import type { GroupStanding } from '~/types'
import { useTeamStore } from '~/stores/teamStore'

defineProps<{ standings: GroupStanding[] }>()
const teams = useTeamStore()
const expanded = ref<string | null>(null)
function toggle(id: string) { expanded.value = expanded.value === id ? null : id }
</script>
<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 dark:bg-gray-900 text-xs uppercase">
        <tr>
          <th class="px-3 py-2 text-left">队伍</th>
          <th class="px-2 py-2 text-center hidden sm:table-cell">赛</th>
          <th class="px-2 py-2 text-center">胜</th>
          <th class="px-2 py-2 text-center">平</th>
          <th class="px-2 py-2 text-center">负</th>
          <th class="px-2 py-2 text-center hidden sm:table-cell">进</th>
          <th class="px-2 py-2 text-center hidden sm:table-cell">失</th>
          <th class="px-2 py-2 text-center hidden sm:table-cell">差</th>
          <th class="px-2 py-2 text-center font-bold">分</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row, i) in standings" :key="row.teamId">
          <tr
            class="border-t border-gray-100 dark:border-gray-900 cursor-pointer sm:cursor-default"
            :class="i < 2 ? 'bg-green-50/50 dark:bg-green-950/20' : ''"
            @click="toggle(row.teamId)"
          >
            <td class="px-3 py-2">
              <NuxtLink :to="`/teams/${row.teamId}`" class="font-medium hover:text-brand-accent inline-flex items-center gap-1.5">
                <span v-if="teams.byId(row.teamId)?.flagEmoji">{{ teams.byId(row.teamId)?.flagEmoji }}</span>
                {{ teams.byId(row.teamId)?.name ?? row.teamId }}
              </NuxtLink>
            </td>
            <td class="px-2 py-2 text-center hidden sm:table-cell">{{ row.played }}</td>
            <td class="px-2 py-2 text-center">{{ row.win }}</td>
            <td class="px-2 py-2 text-center">{{ row.draw }}</td>
            <td class="px-2 py-2 text-center">{{ row.lose }}</td>
            <td class="px-2 py-2 text-center hidden sm:table-cell">{{ row.goalsFor }}</td>
            <td class="px-2 py-2 text-center hidden sm:table-cell">{{ row.goalsAgainst }}</td>
            <td class="px-2 py-2 text-center hidden sm:table-cell">{{ row.goalDiff }}</td>
            <td class="px-2 py-2 text-center font-bold">{{ row.points }}</td>
          </tr>
          <tr v-if="expanded === row.teamId" class="sm:hidden bg-gray-50 dark:bg-gray-900">
            <td colspan="9" class="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
              赛 {{ row.played }} · 进 {{ row.goalsFor }} · 失 {{ row.goalsAgainst }} · 差 {{ row.goalDiff }}
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
