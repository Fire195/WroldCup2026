import { ref, readonly } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

const toasts = ref<Toast[]>([])
let nextId = 0

export const useToast = () => {
  const add = (message: string, type: 'success' | 'error') => {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 3000)
  }

  return {
    toasts: readonly(toasts),
    success: (message: string) => add(message, 'success'),
    error: (message: string) => add(message, 'error'),
  }
}
