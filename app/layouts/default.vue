<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import MobileTabBar from '~/components/MobileTabBar.vue'
import ToastContainer from '~/components/ToastContainer.vue'
</script>
<template>
  <div class="min-h-screen flex flex-col bg-stone-50 dark:bg-gray-950">
    <AppHeader />
    <main class="flex-1 pb-20 md:pb-12">
      <slot />
    </main>
    <MobileTabBar />
    <ToastContainer />
  </div>
</template>
