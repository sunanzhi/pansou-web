import { ref } from 'vue'

export interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

export const toasts = ref<ToastItem[]>([])

let toastId = 0

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 2500) {
  const id = ++toastId
  toasts.value.push({ id, message, type })

  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, duration)
}
