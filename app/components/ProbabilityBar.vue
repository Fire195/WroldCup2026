<script setup lang="ts">
defineProps<{ homeWin: number; draw: number; awayWin: number; homeName: string; awayName: string }>()
</script>
<template>
  <div>
    <div class="flex h-8 rounded overflow-hidden text-xs font-semibold text-white">
      <div class="bg-brand flex items-center justify-center" :style="{ width: homeWin + '%' }"
        :title="`${homeName} 胜 ${homeWin}%`">{{ homeWin }}%</div>
      <div class="bg-gray-500 flex items-center justify-center" :style="{ width: draw + '%' }"
        title="平局">{{ draw }}%</div>
      <div class="bg-brand-accent flex items-center justify-center" :style="{ width: awayWin + '%' }"
        :title="`${awayName} 胜 ${awayWin}%`">{{ awayWin }}%</div>
    </div>
    <div class="mt-1 grid grid-cols-3 text-xs text-gray-500 dark:text-gray-400">
      <span>{{ homeName }} 胜</span>
      <span class="text-center">平</span>
      <span class="text-right">{{ awayName }} 胜</span>
    </div>
  </div>
</template>
