import { ref, watch } from 'vue'
import type { AppSettings } from '@/types'

const SETTINGS_KEY = 'pansou_app_settings'

const DEFAULT_BRAND_NAME = (import.meta.env.VITE_APP_BRAND_NAME as string) || 'PanSearch'
const DEFAULT_BRAND_SUBTITLE = (import.meta.env.VITE_APP_BRAND_SUBTITLE as string) || '极简聚合搜索'

const defaultSettings: AppSettings = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) || '',
  sourceType: 'all',
  resultType: 'all',
  concurrency: 20,
  autoCheckTopLinks: false,
  defaultIncludeWords: '',
  defaultExcludeWords: '',
  theme: 'system',
  brandName: DEFAULT_BRAND_NAME,
  brandSubtitle: DEFAULT_BRAND_SUBTITLE,
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

export function applyTheme() {
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

function updateDocumentTitle() {
  const name = settings.value.brandName || DEFAULT_BRAND_NAME
  const subtitle = settings.value.brandSubtitle || DEFAULT_BRAND_SUBTITLE
  document.title = `${name} - ${subtitle}`
}

// 模块级监听，避免重复注册
watch(() => settings.value.theme, applyTheme, { immediate: true })
watch(() => [settings.value.brandName, settings.value.brandSubtitle], updateDocumentTitle, { immediate: true })

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

  return {
    settings,
    saveSettings,
    resetSettings,
    applyTheme,
  }
}
