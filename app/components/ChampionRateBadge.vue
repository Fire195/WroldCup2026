<script setup lang="ts">
defineProps<{ rate: number }>()
</script>
<template>
  <div class="rounded-xl bg-gradient-to-br from-brand to-brand-accent p-5 text-white text-center">
    <div class="text-xs uppercase opacity-80">夺冠概率</div>
    <div class="text-4xl font-bold tabular-nums">{{ rate.toFixed(1) }}%</div>
  </div>
</template>
