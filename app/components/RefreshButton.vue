<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { useTeamStore } from '~/stores/teamStore'
import { useMatchStore } from '~/stores/matchStore'

const { success, error } = useToast()
const teamStore = useTeamStore()
const matchStore = useMatchStore()
const isLoading = ref(false)

const handleRefresh = async () => {
  if (isLoading.value) return

  isLoading.value = true
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await $fetch<{ updated: number; error?: string }>('/api/sync', {
      method: 'POST',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.error) {
      error(`更新失败：${response.error}`)
      return
    }

    await Promise.all([
      teamStore.hydrate(true),
      matchStore.hydrate(true),
    ])

    success(`数据已更新，共更新 ${response.updated} 场比赛`)
  } catch (e: any) {
    if (e.name === 'AbortError') {
      error('更新超时，请稍后重试')
    } else if (e.message?.includes('fetch')) {
      error('网络连接失败，请检查网络后重试')
    } else {
      error('数据刷新失败，请重新加载页面')
    }
  } finally {
    isLoading.value = false
  }
}
</script>
<template>
  <button
    @click="handleRefresh"
    :disabled="isLoading"
    :aria-label="isLoading ? '正在更新数据' : '更新数据'"
    :aria-busy="isLoading"
    :class="[
      'p-2 rounded-lg transition-all',
      'text-stone-600 dark:text-gray-300',
      'hover:bg-stone-100/60 dark:hover:bg-gray-800/60',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ]"
  >
    <span
      :class="[
        'block text-xl',
        isLoading && 'animate-spin'
      ]"
    >
      🔄
    </span>
  </button>
</template>
