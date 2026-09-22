<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 transition-all flex flex-col gap-6"
    >
      <!-- 头部 -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Sliders class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">系统配置中心</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500">仅授权登录用户可见与可调节</p>
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

      <!-- 设置项目表单 -->
      <div class="flex flex-col gap-5 text-xs sm:text-sm">
        <!-- 1. API 基础端点 -->
        <div class="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <div class="flex items-center justify-between">
            <label class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Globe class="w-4 h-4 text-emerald-500" />
              <span>后端 API 地址</span>
            </label>
            <span class="text-[11px] text-slate-400">留空则默认请求本站相对路径</span>
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model="form.apiBaseUrl"
              type="text"
              placeholder="例如: https://api.yourdomain.com"
              class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 text-xs sm:text-sm"
            />
            <button
              type="button"
              @click="handlePingTest"
              :disabled="pinging"
              class="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs hover:bg-slate-300 dark:hover:bg-slate-600 shrink-0 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Loader2 v-if="pinging" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ pinging ? '测试中' : '测速' }}</span>
            </button>
          </div>

          <!-- 测试结果显示 -->
          <div v-if="pingResult" class="text-xs flex items-center gap-1.5 mt-1 font-medium" :class="pingResult.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
            <CheckCircle2 v-if="pingResult.success" class="w-3.5 h-3.5" />
            <XCircle v-else class="w-3.5 h-3.5" />
            <span>{{ pingResult.message }}</span>
          </div>
        </div>

        <!-- 2. 搜索偏好 -->
        <div class="flex flex-col gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <h4 class="font-semibold text-slate-800 dark:text-slate-200">搜索偏好</h4>

          <!-- 默认数据源 -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="font-medium text-slate-700 dark:text-slate-300">默认搜索来源</div>
              <div class="text-[11px] text-slate-400">选择默认使用的聚合源</div>
            </div>
            <select
              v-model="form.sourceType"
              class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none text-xs"
            >
              <option value="all">全网聚合 (TG + 插件)</option>
              <option value="tg">仅 TG 频道</option>
              <option value="plugin">仅扩展插件</option>
            </select>
          </div>

          <!-- 默认并发数 -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="font-medium text-slate-700 dark:text-slate-300">默认并发搜索数</div>
              <div class="text-[11px] text-slate-400">控制同时发起的频道/插件请求数 (当前: {{ form.concurrency }})</div>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              v-model.number="form.concurrency"
              class="w-36 accent-emerald-600 cursor-pointer"
            />
          </div>

          <!-- 默认自动存活检测 -->
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-slate-700 dark:text-slate-300">自动检测前排链接存活</div>
              <div class="text-[11px] text-slate-400">搜索完成时自动对支持的网盘探测状态</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.autoCheckTopLinks" class="sr-only peer" />
              <div class="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        <!-- 3. 用户会话信息 -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-2">
          <div class="font-semibold text-slate-800 dark:text-slate-200">当前会话</div>
          <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>登录账号:</span>
            <span class="font-mono font-medium text-slate-800 dark:text-slate-200">{{ username }}</span>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Token 过期时间:</span>
            <span class="font-mono text-slate-800 dark:text-slate-200">{{ sessionExpiryText }}</span>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          @click="handleReset"
          class="px-4 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          恢复默认
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            @click="handleSave"
            class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-all active:scale-[0.98]"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { Sliders, X, Globe, CheckCircle2, XCircle, Loader2 } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { checkHealth } from '@/services/api'
import { showToast } from '@/utils/toast'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { username, session } = useAuthStore()
const { settings, saveSettings, resetSettings } = useSettingsStore()

const form = reactive({
  apiBaseUrl: settings.value.apiBaseUrl,
  sourceType: settings.value.sourceType,
  concurrency: settings.value.concurrency,
  autoCheckTopLinks: settings.value.autoCheckTopLinks,
})

const pinging = ref(false)
const pingResult = ref<{ success: boolean; message: string } | null>(null)

const sessionExpiryText = computed(() => {
  if (!session.value?.expiresAt) return '未设置或永久'
  const exp = new Date(session.value.expiresAt * 1000)
  return exp.toLocaleString()
})

watch(
  () => props.show,
  (val) => {
    if (val) {
      form.apiBaseUrl = settings.value.apiBaseUrl
      form.sourceType = settings.value.sourceType
      form.concurrency = settings.value.concurrency
      form.autoCheckTopLinks = settings.value.autoCheckTopLinks
      pingResult.value = null
    }
  }
)

async function handlePingTest() {
  pinging.value = true
  pingResult.value = null
  const startTime = Date.now()

  // 临时暂存以供 checkHealth() 使用
  const backup = settings.value.apiBaseUrl
  settings.value.apiBaseUrl = form.apiBaseUrl

  try {
    const health = await checkHealth()
    const latency = Date.now() - startTime
    pingResult.value = {
      success: true,
      message: `连通成功！延迟: ${latency}ms (插件: ${health.plugin_count ?? '已启用'}, 频道: ${health.channels_count ?? '默认'})`,
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : '连接失败'
    pingResult.value = {
      success: false,
      message: `连接失败: ${errMsg}`,
    }
  } finally {
    // 恢复
    settings.value.apiBaseUrl = backup
    pinging.value = false
  }
}

function handleSave() {
  saveSettings({
    apiBaseUrl: form.apiBaseUrl.trim(),
    sourceType: form.sourceType,
    concurrency: form.concurrency,
    autoCheckTopLinks: form.autoCheckTopLinks,
  })
  showToast('系统配置已保存', 'success')
  emit('close')
}

function handleReset() {
  resetSettings()
  form.apiBaseUrl = settings.value.apiBaseUrl
  form.sourceType = settings.value.sourceType
  form.concurrency = settings.value.concurrency
  form.autoCheckTopLinks = settings.value.autoCheckTopLinks
  showToast('已恢复为默认配置', 'info')
}
</script>
