import { useUiStore } from '~/stores/uiStore'
export default defineNuxtPlugin(() => {
  useUiStore().initTheme()
})
