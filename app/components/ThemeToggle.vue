<script setup lang="ts">
import { useUiStore } from '~/stores/uiStore'
const ui = useUiStore()
</script>
<template>
  <button
    class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors"
    :aria-label="ui.theme === 'dark' ? '切换到浅色' : '切换到深色'"
    @click="ui.toggleTheme"
  >
    <span class="text-lg">{{ ui.theme === 'dark' ? '☀️' : '🌙' }}</span>
  </button>
</template>
