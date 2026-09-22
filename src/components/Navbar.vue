<template>
  <header class="w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <!-- Logo & 标题 -->
      <div class="flex items-center gap-3 cursor-pointer select-none" @click="$emit('resetHome')">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold">
          <Search class="w-5 h-5 text-white stroke-[2.5]" />
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <span class="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight">PanSou</span>
            <span class="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">Web</span>
          </div>
          <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">极简聚合搜索</span>
        </div>
      </div>

      <!-- 右侧操作区 -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- 主题切换按钮 -->
        <button
          type="button"
          @click="toggleTheme"
          class="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          :title="themeTitle"
        >
          <Sun v-if="currentTheme === 'light'" class="w-4 h-4" />
          <Moon v-else-if="currentTheme === 'dark'" class="w-4 h-4" />
          <Laptop v-else class="w-4 h-4" />
        </button>

        <!-- 已登录状态展示 -->
        <template v-if="isLoggedIn">
          <!-- 用户名胶囊 -->
          <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <User class="w-3.5 h-3.5 text-emerald-500" />
            <span class="max-w-[100px] truncate">{{ username }}</span>
          </div>

          <!-- 设置按钮 -->
          <button
            type="button"
            @click="$emit('openSettings')"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors shadow-sm"
            title="高级设置"
          >
            <Settings class="w-3.5 h-3.5 text-slate-500" />
            <span class="hidden sm:inline">配置</span>
          </button>

          <!-- 退出登录按钮 -->
          <button
            type="button"
            @click="handleLogout"
            class="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 transition-colors"
            title="退出登录"
          >
            <LogOut class="w-3.5 h-3.5" />
            <span class="hidden sm:inline ml-1">退出</span>
          </button>
        </template>

        <!-- 未登录状态展示（仅显示低调的登录入口，绝不出现任何配置选项） -->
        <template v-else>
          <button
            type="button"
            @click="$emit('openLogin')"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <LogIn class="w-3.5 h-3.5" />
            <span>登录</span>
          </button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Search, Sun, Moon, Laptop, User, Settings, LogOut, LogIn } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { showToast } from '@/utils/toast'

defineEmits<{
  (e: 'resetHome'): void
  (e: 'openSettings'): void
  (e: 'openLogin'): void
}>()

const { isLoggedIn, username, logout } = useAuthStore()
const { settings, saveSettings } = useSettingsStore()

const currentTheme = computed(() => settings.value.theme)

const themeTitle = computed(() => {
  if (currentTheme.value === 'light') return '浅色模式 (点击切换为深色)'
  if (currentTheme.value === 'dark') return '深色模式 (点击切换为跟随系统)'
  return '跟随系统 (点击切换为浅色)'
})

function toggleTheme() {
  const nextTheme: Record<string, 'light' | 'dark' | 'system'> = {
    light: 'dark',
    dark: 'system',
    system: 'light',
  }
  const next = nextTheme[currentTheme.value] || 'system'
  saveSettings({ theme: next })
}

function handleLogout() {
  logout()
  showToast('已安全退出登录', 'info')
}
</script>
