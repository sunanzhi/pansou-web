<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm transition-all"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 transition-all flex flex-col"
    >
      <!-- 头部 -->
      <div class="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
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

      <!-- 导航标签切换 -->
      <div class="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 shrink-0 text-xs sm:text-sm font-medium">
        <button
          type="button"
          @click="activeNav = 'general'"
          class="pb-2.5 px-2 border-b-2 transition-colors flex items-center gap-1.5"
          :class="[
            activeNav === 'general'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
          ]"
        >
          <Settings class="w-4 h-4" />
          <span>常规设置</span>
        </button>

        <button
          type="button"
          @click="activeNav = 'channels'"
          class="pb-2.5 px-2 border-b-2 transition-colors flex items-center gap-1.5"
          :class="[
            activeNav === 'channels'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
          ]"
        >
          <Radio class="w-4 h-4" />
          <span>TG 频道管理</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
            {{ selectedChannelsCount }}/{{ allChannels.length }}
          </span>
        </button>

        <button
          type="button"
          @click="activeNav = 'plugins'"
          class="pb-2.5 px-2 border-b-2 transition-colors flex items-center gap-1.5"
          :class="[
            activeNav === 'plugins'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
          ]"
        >
          <Puzzle class="w-4 h-4" />
          <span>扩展插件管理</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
            {{ selectedPluginsCount }}/{{ allPlugins.length }}
          </span>
        </button>
      </div>

      <!-- 主体滚动区域 -->
      <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-xs sm:text-sm custom-scrollbar">
        <!-- ======================= 1. 常规设置 ======================= -->
        <div v-if="activeNav === 'general'" class="flex flex-col gap-5">
          <!-- API 基础端点 -->
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
                placeholder="例如: https://pan-api.mpe.run"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 text-xs sm:text-sm"
              />
              <button
                type="button"
                @click="handlePingTest"
                :disabled="pinging"
                class="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs hover:bg-slate-300 dark:hover:bg-slate-600 shrink-0 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <Loader2 v-if="pinging" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ pinging ? '测试中' : '测速' }}</span>
              </button>
            </div>

            <div v-if="pingResult" class="text-xs flex items-center gap-1.5 mt-1 font-medium" :class="pingResult.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
              <CheckCircle2 v-if="pingResult.success" class="w-3.5 h-3.5" />
              <XCircle v-else class="w-3.5 h-3.5" />
              <span>{{ pingResult.message }}</span>
            </div>
          </div>

          <!-- 自定义品牌名称与信息 -->
          <div class="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div class="flex items-center justify-between">
              <label class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles class="w-4 h-4 text-emerald-500" />
                <span>品牌与站点信息</span>
              </label>
              <span class="text-[11px] text-slate-400">个性化定制主品牌名与副标题</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-slate-600 dark:text-slate-300 mb-1 text-[11px]">主品牌名</label>
                <input
                  v-model="form.brandName"
                  type="text"
                  placeholder="默认: PanSearch"
                  class="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 text-xs"
                />
              </div>
              <div>
                <label class="block font-medium text-slate-600 dark:text-slate-300 mb-1 text-[11px]">副标题 / 描述</label>
                <input
                  v-model="form.brandSubtitle"
                  type="text"
                  placeholder="默认: 极简聚合搜索"
                  class="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>
          </div>

          <!-- 搜索偏好 -->
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

          <!-- 用户会话信息 -->
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

        <!-- ======================= 2. TG 频道管理 ======================= -->
        <div v-else-if="activeNav === 'channels'" class="flex flex-col gap-3">
          <!-- 频道顶部操作栏：添加新频道、快捷按钮 -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span class="font-semibold text-slate-800 dark:text-slate-200">添加自定义 TG 频道</span>
              <span class="text-[11px] text-slate-400">输入公开频道用户名，例如 Aliyun_4K_Movies</span>
            </div>

            <!-- 添加新频道输入框 -->
            <div class="flex items-center gap-2">
              <input
                v-model="newChannelInput"
                type="text"
                placeholder="输入新频道名称 (回车即可添加)"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 text-xs sm:text-sm"
                @keyup.enter="handleAddChannel"
              />
              <button
                type="button"
                @click="handleAddChannel"
                :disabled="!newChannelInput.trim()"
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shrink-0 transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>添加</span>
              </button>
            </div>
          </div>

          <!-- 频道过滤与批量控制 -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <!-- 搜索过滤 -->
            <div class="relative w-full sm:w-64">
              <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="channelSearchQuery"
                type="text"
                placeholder="搜索频道名称..."
                class="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-emerald-500"
              />
            </div>

            <!-- 快捷批量操作 -->
            <div class="flex items-center gap-1.5 self-end sm:self-auto text-xs">
              <button
                type="button"
                @click="selectAllChannels"
                class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                全选
              </button>
              <button
                type="button"
                @click="deselectAllChannels"
                class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                全不选
              </button>
              <button
                type="button"
                @click="resetChannelsToDefault"
                class="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                恢复默认
              </button>
            </div>
          </div>

          <!-- 频道列表卡片网格 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            <div
              v-for="ch in filteredChannelList"
              :key="ch"
              @click="toggleChannel(ch)"
              class="flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all"
              :class="[
                selectedChannelsMap[ch]
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100'
                  : 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 opacity-60',
              ]"
            >
              <div class="flex items-center gap-2 truncate">
                <input
                  type="checkbox"
                  :checked="selectedChannelsMap[ch]"
                  class="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer pointer-events-none"
                />
                <span class="font-mono truncate text-xs">{{ ch }}</span>
                <span
                  v-if="customAddedChannels.includes(ch)"
                  class="text-[9px] px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                >
                  自定义
                </span>
              </div>

              <!-- 自定义添加频道的删除按钮 -->
              <button
                v-if="customAddedChannels.includes(ch)"
                type="button"
                @click.stop="handleRemoveCustomChannel(ch)"
                class="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="删除该频道"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- ======================= 3. 扩展插件管理 ======================= -->
        <div v-else-if="activeNav === 'plugins'" class="flex flex-col gap-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <!-- 搜索过滤 -->
            <div class="relative w-full sm:w-64">
              <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="pluginSearchQuery"
                type="text"
                placeholder="搜索插件名称..."
                class="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-emerald-500"
              />
            </div>

            <!-- 快捷批量操作 -->
            <div class="flex items-center gap-1.5 self-end sm:self-auto text-xs">
              <button
                type="button"
                @click="selectAllPlugins"
                class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                全选
              </button>
              <button
                type="button"
                @click="deselectAllPlugins"
                class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                全不选
              </button>
              <button
                type="button"
                @click="resetPluginsToDefault"
                class="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                恢复默认
              </button>
            </div>
          </div>

          <!-- 插件列表网格 -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
            <div
              v-for="p in filteredPluginList"
              :key="p"
              @click="togglePlugin(p)"
              class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all truncate"
              :class="[
                selectedPluginsMap[p]
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100'
                  : 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 opacity-60',
              ]"
            >
              <input
                type="checkbox"
                :checked="selectedPluginsMap[p]"
                class="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer pointer-events-none"
              />
              <span class="font-mono truncate text-xs">{{ p }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
        <button
          type="button"
          @click="handleReset"
          class="px-4 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          恢复初始设置
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
            class="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-all active:scale-[0.98]"
          >
            保存并应用配置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import {
  Sliders,
  Settings,
  Radio,
  Puzzle,
  X,
  Globe,
  Sparkles,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
} from '@lucide/vue'
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

const activeNav = ref<'general' | 'channels' | 'plugins'>('general')

const form = reactive({
  apiBaseUrl: settings.value.apiBaseUrl,
  sourceType: settings.value.sourceType,
  concurrency: settings.value.concurrency,
  autoCheckTopLinks: settings.value.autoCheckTopLinks,
  brandName: settings.value.brandName || '',
  brandSubtitle: settings.value.brandSubtitle || '',
})

// 后端探测到的原始完整频道与插件列表
const backendDefaultChannels = ref<string[]>([])
const backendDefaultPlugins = ref<string[]>([])

// 用户自定义添加的新增频道列表 (保存在 localStorage)
const CUSTOM_CHANNELS_STORAGE_KEY = 'pansou_custom_added_channels'
const customAddedChannels = ref<string[]>([])

// 频道选择状态 Map: channelName -> boolean
const selectedChannelsMap = reactive<Record<string, boolean>>({})
// 插件选择状态 Map: pluginName -> boolean
const selectedPluginsMap = reactive<Record<string, boolean>>({})

// 搜索过滤关键词与新频道输入
const newChannelInput = ref('')
const channelSearchQuery = ref('')
const pluginSearchQuery = ref('')

const pinging = ref(false)
const pingResult = ref<{ success: boolean; message: string } | null>(null)

const sessionExpiryText = computed(() => {
  if (!session.value?.expiresAt) return '未设置或永久'
  const exp = new Date(session.value.expiresAt * 1000)
  return exp.toLocaleString()
})

// 所有的频道（后端默认 + 用户自定义添加）
const allChannels = computed(() => {
  const merged = Array.from(new Set([...backendDefaultChannels.value, ...customAddedChannels.value]))
  return merged
})

const allPlugins = computed(() => {
  return backendDefaultPlugins.value
})

const selectedChannelsCount = computed(() => {
  return Object.values(selectedChannelsMap).filter(Boolean).length
})

const selectedPluginsCount = computed(() => {
  return Object.values(selectedPluginsMap).filter(Boolean).length
})

const filteredChannelList = computed(() => {
  const q = channelSearchQuery.value.trim().toLowerCase()
  if (!q) return allChannels.value
  return allChannels.value.filter((c) => c.toLowerCase().includes(q))
})

const filteredPluginList = computed(() => {
  const q = pluginSearchQuery.value.trim().toLowerCase()
  if (!q) return allPlugins.value
  return allPlugins.value.filter((p) => p.toLowerCase().includes(q))
})

function loadCustomChannels() {
  try {
    const raw = localStorage.getItem(CUSTOM_CHANNELS_STORAGE_KEY)
    if (raw) {
      customAddedChannels.value = JSON.parse(raw)
    }
  } catch {
    customAddedChannels.value = []
  }
}

function saveCustomChannelsToStorage() {
  try {
    localStorage.setItem(CUSTOM_CHANNELS_STORAGE_KEY, JSON.stringify(customAddedChannels.value))
  } catch (e) {
    console.error('Failed to save custom channels', e)
  }
}

async function loadBackendMetadata() {
  try {
    const health = await checkHealth()
    if (health.channels && health.channels.length > 0) {
      backendDefaultChannels.value = health.channels
    }
    if (health.plugins && health.plugins.length > 0) {
      backendDefaultPlugins.value = health.plugins
    }
    initSelectionMaps()
  } catch {
    // 探测失败时静默处理
  }
}

function initSelectionMaps() {
  // 1. 初始化频道选择
  const savedChannels = settings.value.enabledChannels
  if (savedChannels && savedChannels.length > 0) {
    // 按用户保存的配置初始化
    for (const ch of allChannels.value) {
      selectedChannelsMap[ch] = savedChannels.includes(ch)
    }
  } else {
    // 默认全部勾选
    for (const ch of allChannels.value) {
      selectedChannelsMap[ch] = true
    }
  }

  // 2. 初始化插件选择
  const savedPlugins = settings.value.enabledPlugins
  if (savedPlugins && savedPlugins.length > 0) {
    for (const p of allPlugins.value) {
      selectedPluginsMap[p] = savedPlugins.includes(p)
    }
  } else {
    for (const p of allPlugins.value) {
      selectedPluginsMap[p] = true
    }
  }
}

function toggleChannel(ch: string) {
  selectedChannelsMap[ch] = !selectedChannelsMap[ch]
}

function togglePlugin(p: string) {
  selectedPluginsMap[p] = !selectedPluginsMap[p]
}

function handleAddChannel() {
  const raw = newChannelInput.value.trim()
  if (!raw) return
  if (allChannels.value.includes(raw)) {
    showToast(`频道 ${raw} 已在列表中`, 'info')
    selectedChannelsMap[raw] = true
    newChannelInput.value = ''
    return
  }
  customAddedChannels.value.push(raw)
  selectedChannelsMap[raw] = true
  saveCustomChannelsToStorage()
  showToast(`已添加新频道: ${raw}`, 'success')
  newChannelInput.value = ''
}

function handleRemoveCustomChannel(ch: string) {
  customAddedChannels.value = customAddedChannels.value.filter((c) => c !== ch)
  delete selectedChannelsMap[ch]
  saveCustomChannelsToStorage()
  showToast(`已删除自定义频道: ${ch}`, 'info')
}

function selectAllChannels() {
  for (const ch of allChannels.value) {
    selectedChannelsMap[ch] = true
  }
}

function deselectAllChannels() {
  for (const ch of allChannels.value) {
    selectedChannelsMap[ch] = false
  }
}

function resetChannelsToDefault() {
  for (const ch of allChannels.value) {
    selectedChannelsMap[ch] = backendDefaultChannels.value.includes(ch)
  }
  showToast('已重置为后端默认频道', 'info')
}

function selectAllPlugins() {
  for (const p of allPlugins.value) {
    selectedPluginsMap[p] = true
  }
}

function deselectAllPlugins() {
  for (const p of allPlugins.value) {
    selectedPluginsMap[p] = false
  }
}

function resetPluginsToDefault() {
  for (const p of allPlugins.value) {
    selectedPluginsMap[p] = backendDefaultPlugins.value.includes(p)
  }
  showToast('已重置为后端默认插件', 'info')
}

watch(
  () => props.show,
  (val) => {
    if (val) {
      form.apiBaseUrl = settings.value.apiBaseUrl
      form.sourceType = settings.value.sourceType
      form.concurrency = settings.value.concurrency
      form.autoCheckTopLinks = settings.value.autoCheckTopLinks
      form.brandName = settings.value.brandName || ''
      form.brandSubtitle = settings.value.brandSubtitle || ''
      pingResult.value = null
      loadCustomChannels()
      loadBackendMetadata()
    }
  }
)

async function handlePingTest() {
  pinging.value = true
  pingResult.value = null
  const startTime = Date.now()

  const backup = settings.value.apiBaseUrl
  settings.value.apiBaseUrl = form.apiBaseUrl

  try {
    const health = await checkHealth()
    const latency = Date.now() - startTime
    pingResult.value = {
      success: true,
      message: `连通成功！延迟: ${latency}ms (插件: ${health.plugin_count ?? 0}个, 频道: ${health.channels_count ?? 0}个)`,
    }
    if (health.channels) backendDefaultChannels.value = health.channels
    if (health.plugins) backendDefaultPlugins.value = health.plugins
    initSelectionMaps()
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : '连接失败'
    pingResult.value = {
      success: false,
      message: `连接失败: ${errMsg}`,
    }
  } finally {
    settings.value.apiBaseUrl = backup
    pinging.value = false
  }
}

function handleSave() {
  const enabledChs = allChannels.value.filter((ch) => selectedChannelsMap[ch])
  const enabledPls = allPlugins.value.filter((p) => selectedPluginsMap[p])

  saveSettings({
    apiBaseUrl: form.apiBaseUrl.trim(),
    sourceType: form.sourceType,
    concurrency: form.concurrency,
    autoCheckTopLinks: form.autoCheckTopLinks,
    brandName: form.brandName.trim() || undefined,
    brandSubtitle: form.brandSubtitle.trim() || undefined,
    enabledChannels: enabledChs,
    enabledPlugins: enabledPls,
  })
  showToast(`系统配置已保存 (启用频道: ${enabledChs.length}个, 插件: ${enabledPls.length}个)`, 'success')
  emit('close')
}

function handleReset() {
  resetSettings()
  form.apiBaseUrl = settings.value.apiBaseUrl
  form.sourceType = settings.value.sourceType
  form.concurrency = settings.value.concurrency
  form.autoCheckTopLinks = settings.value.autoCheckTopLinks
  form.brandName = settings.value.brandName || ''
  form.brandSubtitle = settings.value.brandSubtitle || ''
  selectAllChannels()
  selectAllPlugins()
  showToast('已恢复为初始默认配置', 'info')
}

onMounted(() => {
  loadCustomChannels()
})
</script>
