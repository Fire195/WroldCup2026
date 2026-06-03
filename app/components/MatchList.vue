<script setup lang="ts">
import type { Match } from '~/types'
import MatchItem from './MatchItem.vue'
defineProps<{ matches: Match[] }>()
</script>
<template>
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <MatchItem v-for="m in matches" :key="m.id" :match="m" />
  </div>
</template>
