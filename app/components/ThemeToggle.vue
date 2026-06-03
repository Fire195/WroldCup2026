<script setup lang="ts">
import { useUiStore } from '~/stores/uiStore'
const ui = useUiStore()
</script>
<template>
  <button
    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[44px] min-h-[44px]"
    :aria-label="ui.theme === 'dark' ? '切换到浅色' : '切换到深色'"
    @click="ui.toggleTheme"
  >
    {{ ui.theme === 'dark' ? '☀️' : '🌙' }}
  </button>
</template>
