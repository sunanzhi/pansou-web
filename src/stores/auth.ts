import { ref, computed } from 'vue'
import type { UserSession } from '@/types'

const STORAGE_KEY = 'pansou_user_session'

function loadSavedSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserSession
    // 检查是否过期
    if (parsed.expiresAt && Date.now() / 1000 > parsed.expiresAt) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

const session = ref<UserSession | null>(loadSavedSession())
const backendAuthEnabled = ref<boolean | null>(null) // null 表示尚未从 /api/health 探测到

export function useAuthStore() {
  const isLoggedIn = computed(() => {
    if (!session.value || !session.value.token) return false
    if (session.value.expiresAt && Date.now() / 1000 > session.value.expiresAt) {
      logout()
      return false
    }
    return true
  })

  const username = computed(() => session.value?.username || '')
  const token = computed(() => session.value?.token || '')

  function setSession(newSession: UserSession) {
    session.value = newSession
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession))
    } catch (e) {
      console.error('Failed to save session to localStorage', e)
    }
  }

  function logout() {
    session.value = null
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Failed to clear session from localStorage', e)
    }
  }

  function setBackendAuthEnabled(val: boolean) {
    backendAuthEnabled.value = val
  }

  return {
    session,
    isLoggedIn,
    username,
    token,
    backendAuthEnabled,
    setSession,
    logout,
    setBackendAuthEnabled,
  }
}
