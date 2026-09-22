<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 transition-all"
    >
      <!-- 头部 -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Lock class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">用户登录</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500">登录后解锁配置及高级功能</p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="mt-5 flex flex-col gap-4">
        <!-- 账号 -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">账号 / 用户名</label>
          <div class="relative">
            <User class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="username"
              type="text"
              required
              placeholder="请输入管理员或授权账号"
              class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        <!-- 密码 -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">登录密码</label>
          <div class="relative">
            <KeyRound class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="password"
              type="password"
              required
              placeholder="请输入密码"
              class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMsg" class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ errorMsg }}</span>
        </div>

        <!-- 提交按钮 -->
        <button
          type="submit"
          :disabled="loading || !username || !password"
          class="w-full mt-2 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <span v-else>立即登录</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Lock, X, User, KeyRound, AlertCircle, Loader2 } from '@lucide/vue'
import { login } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { showToast } from '@/utils/toast'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'loginSuccess'): void
}>()

const { setSession } = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  if (!username.value || !password.value) return
  loading.value = true
  errorMsg.value = ''

  try {
    const res = await login({
      username: username.value.trim(),
      password: password.value,
    })

    setSession({
      token: res.token,
      username: res.username || username.value,
      expiresAt: res.expires_at,
    })

    showToast(`欢迎回来，${res.username || username.value}`, 'success')
    emit('loginSuccess')
    emit('close')
    username.value = ''
    password.value = ''
  } catch (err: unknown) {
    errorMsg.value = err instanceof Error ? err.message : '登录失败，请检查账号密码'
  } finally {
    loading.value = false
  }
}
</script>
