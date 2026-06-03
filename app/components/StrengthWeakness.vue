<script setup lang="ts">
defineProps<{ strength: string[]; weakness: string[] }>()
</script>
<template>
  <div class="grid sm:grid-cols-2 gap-4">
    <div class="rounded-xl p-4 bg-green-50 dark:bg-green-950/30">
      <h3 class="font-semibold text-green-700 dark:text-green-400 mb-2">优势</h3>
      <ul class="space-y-1 text-sm">
        <li v-for="s in strength" :key="s">· {{ s }}</li>
      </ul>
    </div>
    <div class="rounded-xl p-4 bg-red-50 dark:bg-red-950/30">
      <h3 class="font-semibold text-red-700 dark:text-red-400 mb-2">短板</h3>
      <ul class="space-y-1 text-sm">
        <li v-for="w in weakness" :key="w">· {{ w }}</li>
      </ul>
    </div>
  </div>
</template>
