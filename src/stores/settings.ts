import { ref, watch } from 'vue'
import type { AppSettings } from '@/types'

const SETTINGS_KEY = 'pansou_app_settings'

const defaultSettings: AppSettings = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) || '',
  sourceType: 'all',
  resultType: 'all',
  concurrency: 20,
  autoCheckTopLinks: false,
  defaultIncludeWords: '',
  defaultExcludeWords: '',
  theme: 'system',
}

function loadSavedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...defaultSettings }
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return { ...defaultSettings }
  }
}

const settings = ref<AppSettings>(loadSavedSettings())

export function useSettingsStore() {
  function saveSettings(newSettings: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...newSettings }
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value))
    } catch (e) {
      console.error('Failed to save settings to localStorage', e)
    }
  }

  function resetSettings() {
    settings.value = { ...defaultSettings }
    try {
      localStorage.removeItem(SETTINGS_KEY)
    } catch (e) {
      console.error('Failed to reset settings in localStorage', e)
    }
  }

  function applyTheme() {
    const isDark =
      settings.value.theme === 'dark' ||
      (settings.value.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 监听主题变化自动应用
  watch(() => settings.value.theme, applyTheme, { immediate: true })

  return {
    settings,
    saveSettings,
    resetSettings,
    applyTheme,
  }
}
