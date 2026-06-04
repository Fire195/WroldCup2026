<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import MobileTabBar from '~/components/MobileTabBar.vue'
</script>
<template>
  <div class="min-h-screen flex flex-col bg-white bg-pitch">
    <AppHeader />
    <main class="flex-1 pb-20 md:pb-12">
      <slot />
    </main>
    <MobileTabBar />
  </div>
</template>
