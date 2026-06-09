<script setup lang="ts">
const groups = ['A','B','C','D','E','F','G','H','I','J','K','L']
const route = useRoute()
const current = computed(() => (route.params.group as string)?.toUpperCase() ?? 'A')
</script>
<template>
  <nav class="overflow-x-auto -mx-4 px-4">
    <div class="flex gap-2 pb-2">
      <NuxtLink v-for="g in groups" :key="g" :to="`/groups/${g}`"
        class="px-4 py-2 rounded-lg text-sm font-semibold border min-w-[44px] text-center dark:text-gray-100"
        :class="g === current
          ? 'bg-brand text-white border-brand'
          : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'">
        {{ g }}
      </NuxtLink>
    </div>
  </nav>
</template>
