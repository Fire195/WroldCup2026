import { defineStore } from 'pinia'

type Theme = 'light' | 'dark'

export const useUiStore = defineStore('ui', {
  state: () => ({ theme: 'light' as Theme, activeGroup: 'A' }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', this.theme === 'dark')
        localStorage.setItem('theme', this.theme)
      }
    },
    initTheme() {
      if (typeof window === 'undefined') return
      const saved = localStorage.getItem('theme') as Theme | null
      const sys: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      this.theme = saved ?? sys
      document.documentElement.classList.toggle('dark', this.theme === 'dark')
    },
    setActiveGroup(g: string) { this.activeGroup = g },
  },
})
