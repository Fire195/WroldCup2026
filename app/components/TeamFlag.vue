<script setup lang="ts">
import { ref } from 'vue'
import { useTeamStore } from '~/stores/teamStore'

const props = withDefaults(defineProps<{
  teamId: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  rounded?: boolean
}>(), {
  size: 'md',
  rounded: true,
})

const teams = useTeamStore()
const team = computed(() => teams.byId(props.teamId))
const failed = ref(false)

const sizeClasses = {
  xs: 'w-4 h-3',
  sm: 'w-5 h-4',
  md: 'w-7 h-5',
  lg: 'w-10 h-7',
  xl: 'w-14 h-10',
  '2xl': 'w-20 h-14',
}

const emojiSizes = {
  xs: 'text-base',
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
  '2xl': 'text-5xl',
}
</script>

<template>
  <span class="inline-flex items-center justify-center flex-shrink-0">
    <img
      v-if="!failed"
      :src="`/flags/${teamId}.svg`"
      :alt="team?.name ?? teamId"
      :class="[sizeClasses[size], rounded ? 'rounded-sm' : '', 'object-cover shadow-sm']"
      loading="lazy"
      @error="failed = true"
    />
    <span v-else-if="team?.flagEmoji" :class="emojiSizes[size]">{{ team.flagEmoji }}</span>
    <span v-else class="text-stone-400 text-xs font-mono">{{ teamId }}</span>
  </span>
</template>
