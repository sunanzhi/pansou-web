<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
    <!-- 顶部导航栏 -->
    <Navbar
      @reset-home="handleResetHome"
      @open-login="showLoginModal = true"
      @open-settings="showSettingsModal = true"
    />

    <!-- 主体内容 -->
    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center">
      <!-- 首页初始英雄区 (未搜索时居中展示) -->
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="!hasSearched" class="w-full text-center mt-6 sm:mt-16 mb-8 select-none">
          <div class="inline-flex items-center justify-center p-3 sm:p-4 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/25 mb-4">
            <Sparkles class="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-800 to-teal-600 dark:from-white dark:via-emerald-300 dark:to-teal-200 bg-clip-text text-transparent">
            {{ brandName }} 聚合搜索
          </h1>
          <p class="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            极简、纯净、无广告 · 聚合 110+ 源站与海量 Telegram 频道网盘资源
          </p>
        </div>
      </transition>

      <!-- 搜索核心组件 -->
      <div class="w-full" :class="{ 'mb-6': hasSearched }">
        <SearchBox
          v-model="currentKeyword"
          :loading="searching"
          @search="handleSearch"
        />
      </div>

      <!-- 快捷热门推荐 (未搜索时展示) -->
      <div v-if="!hasSearched" class="w-full max-w-xl mt-6 flex flex-col items-center gap-2 text-xs text-slate-400">
        <span>热门搜索推荐:</span>
        <div class="flex flex-wrap justify-center gap-2">
          <button
            v-for="item in hotTags"
            :key="item"
            type="button"
            @click="quickSearch(item)"
            class="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-sm"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <!-- 搜索结果区域 -->
      <div v-if="hasSearched" class="w-full mt-4 flex flex-col gap-4">
        <!-- 分类切换 Tabs & 汇总统计 -->
        <div class="w-full flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
          <div class="flex-1 min-w-0">
            <CloudTabs
              :active-key="activeTab"
              :total-count="displayResults.length"
              :counts-by-type="countsByType"
              @select="handleSelectTab"
            />
          </div>

          <!-- 批量检测存活按钮 (仅登录用户且有结果时显示) -->
          <button
            v-if="isLoggedIn && filteredResults.length > 0"
            type="button"
            @click="batchCheckVisibleLinks"
            :disabled="batchChecking"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors shrink-0 self-start sm:self-auto"
            title="一键检测当前前 10 条支持网盘的存活状态"
          >
            <Loader2 v-if="batchChecking" class="w-3.5 h-3.5 animate-spin" />
            <Activity v-else class="w-3.5 h-3.5" />
            <span>批量存活检测</span>
          </button>
        </div>

        <!-- 加载中骨架屏 -->
        <div v-if="searching" class="w-full flex flex-col gap-3 py-6">
          <div v-for="i in 3" :key="i" class="w-full h-32 rounded-2xl bg-slate-100 dark:bg-slate-900/60 animate-pulse border border-slate-200/50 dark:border-slate-800/50"></div>
        </div>

        <!-- 搜索结果列表 (支持懒加载) -->
        <div v-else-if="filteredResults.length > 0" class="w-full flex flex-col gap-3.5">
          <ResultCard
            v-for="res in visibleResults"
            :key="res.unique_id || res.message_id || (res.channel + res.datetime)"
            :result="res"
            :check-results="checkResults"
            :checking-status="checkingStatus"
            @check-link="handleCheckLink"
          />

          <!-- 懒加载交互区与状态提示 -->
          <div class="w-full py-4 flex flex-col items-center justify-center gap-2">
            <!-- 滚动探测哨兵 -->
            <div ref="sentinelRef" class="h-1 w-full pointer-events-none"></div>

            <button
              v-if="hasMore"
              type="button"
              @click="loadMore"
              class="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-800 transition-colors shadow-sm flex items-center gap-2"
            >
              <span>加载更多结果 (已展示 {{ visibleResults.length }} / 共 {{ filteredResults.length }} 条)</span>
            </button>
            <span v-else class="text-xs text-slate-400 dark:text-slate-500 py-2">
              已展示全部 {{ filteredResults.length }} 条结果
            </span>
          </div>
        </div>

        <!-- 无结果空状态 -->
        <div v-else class="w-full py-16 flex flex-col items-center justify-center text-center text-slate-400">
          <Inbox class="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3 stroke-[1.5]" />
          <h4 class="text-base font-semibold text-slate-700 dark:text-slate-300">未检索到相关资源</h4>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
            请尝试缩短关键词、使用更通用的名称，或在高级设置中切换为全网搜索源重新尝试
          </p>
        </div>
      </div>
    </main>

    <!-- 底部版权与免责声明 -->
    <footer class="w-full py-6 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-400 dark:text-slate-500">
      <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>{{ brandName }} Web · 极简网盘搜索聚合客户端</span>
        <span>仅供学习与资源聚合索引，本站不存储任何实际网盘文件</span>
      </div>
    </footer>

    <!-- 登录弹窗 -->
    <LoginModal
      :show="showLoginModal"
      @close="showLoginModal = false"
      @login-success="handleLoginSuccess"
    />

    <!-- 设置弹窗 -->
    <SettingsModal
      :show="showSettingsModal"
      @close="showSettingsModal = false"
    />

    <!-- 全局轻提示 -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Sparkles, Inbox, Activity, Loader2 } from '@lucide/vue'
import Navbar from '@/components/Navbar.vue'
import SearchBox from '@/components/SearchBox.vue'
import CloudTabs from '@/components/CloudTabs.vue'
import ResultCard from '@/components/ResultCard.vue'
import LoginModal from '@/components/LoginModal.vue'
import SettingsModal from '@/components/SettingsModal.vue'
import Toast from '@/components/Toast.vue'
import { search, checkLinks, checkHealth, AuthRequiredError } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { showToast } from '@/utils/toast'
import type { SearchResult, Link, CheckResult, SearchRequest } from '@/types'

const { isLoggedIn, setBackendAuthEnabled } = useAuthStore()
const { settings } = useSettingsStore()
const brandName = computed(() => settings.value.brandName || 'PanSearch')

const PAGE_SIZE = 20
const visibleLimit = ref(PAGE_SIZE)


const currentKeyword = ref('')
const searching = ref(false)
const hasSearched = ref(false)
const displayResults = ref<SearchResult[]>([])
const activeTab = ref('') // '' 代表全部

// 链接存活检测记录
const checkResults = ref<Record<string, CheckResult>>({})
const checkingStatus = ref<Record<string, 'checking' | 'done' | 'error'>>({})
const batchChecking = ref(false)

// 弹窗开关
const showLoginModal = ref(false)
const showSettingsModal = ref(false)

// 热门快捷搜索
const hotTags = ['庆余年', '三体', '黑神话悟空', '周杰伦', '4K电影', 'Python教程', '无损音乐']

// 各网盘类型资源数量统计
const countsByType = computed(() => {
  const counts: Record<string, number> = {}
  for (const item of displayResults.value) {
    for (const link of item.links || []) {
      const t = (link.type || 'others').toLowerCase()
      counts[t] = (counts[t] || 0) + 1
    }
  }
  return counts
})

// 根据当前选中的 Tab 过滤后的结果展示
const filteredResults = computed(() => {
  if (!activeTab.value) {
    return displayResults.value
  }
  const tab = activeTab.value.toLowerCase()
  return displayResults.value
    .filter((item) => (item.links || []).some((l) => (l.type || '').toLowerCase() === tab))
    .map((item) => ({
      ...item,
      links: (item.links || []).filter((l) => (l.type || '').toLowerCase() === tab),
    }))
})

// 懒加载切片展示
const visibleResults = computed(() => {
  return filteredResults.value.slice(0, visibleLimit.value)
})

const hasMore = computed(() => {
  return visibleResults.value.length < filteredResults.value.length
})

function loadMore() {
  if (hasMore.value) {
    visibleLimit.value += PAGE_SIZE
  }
}

function handleSelectTab(key: string) {
  activeTab.value = key
  visibleLimit.value = PAGE_SIZE
}

const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function setupObserver() {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (!sentinelRef.value || typeof IntersectionObserver === 'undefined') return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && hasMore.value) {
        loadMore()
      }
    },
    { rootMargin: '200px' }
  )

  observer.observe(sentinelRef.value)
}

watch(sentinelRef, () => {
  setupObserver()
})

function quickSearch(kw: string) {
  currentKeyword.value = kw
  handleSearch({
    keyword: kw,
    refresh: false,
    source: settings.value.sourceType,
  })
}

function handleResetHome() {
  hasSearched.value = false
  currentKeyword.value = ''
  displayResults.value = []
  activeTab.value = ''
  visibleLimit.value = PAGE_SIZE
}

async function handleSearch(payload: {
  keyword: string
  refresh: boolean
  source: 'all' | 'tg' | 'plugin'
  include?: string[]
  exclude?: string[]
}) {
  if (!payload.keyword.trim()) return

  searching.value = true
  hasSearched.value = true
  activeTab.value = ''
  visibleLimit.value = PAGE_SIZE
  const req: SearchRequest = {
    kw: payload.keyword.trim(),
    src: payload.source || settings.value.sourceType || 'all',
    conc: settings.value.concurrency || 20,
    refresh: payload.refresh,
    res: 'all',
  }

  // 用户自定义勾选的频道
  if (settings.value.enabledChannels && settings.value.enabledChannels.length > 0) {
    req.channels = settings.value.enabledChannels
  }

  // 用户自定义勾选的插件
  if (settings.value.enabledPlugins && settings.value.enabledPlugins.length > 0) {
    req.plugins = settings.value.enabledPlugins
  }

  if (payload.include?.length || payload.exclude?.length) {
    req.filter = {
      include: payload.include,
      exclude: payload.exclude,
    }
  }

  try {
    const data = await search(req)
    displayResults.value = data.results || []

    if (displayResults.value.length === 0) {
      showToast('未找到匹配的网盘资源', 'info')
    } else {
      showToast(`已聚合找到 ${displayResults.value.length} 条网盘资源`, 'success')

      // 如果开启了自动探测前排存活
      if (settings.value.autoCheckTopLinks) {
        batchCheckVisibleLinks()
      }
    }
  } catch (err: unknown) {
    if (err instanceof AuthRequiredError) {
      showLoginModal.value = true
      return
    }
    const msg = err instanceof Error ? err.message : '搜索失败，请稍后重试'
    showToast(msg, 'error')
    displayResults.value = []
  } finally {
    searching.value = false
  }
}

async function handleCheckLink(link: Link) {
  if (checkingStatus.value[link.url] === 'checking') return
  checkingStatus.value[link.url] = 'checking'

  try {
    const resp = await checkLinks([
      {
        url: link.url,
        password: link.password,
        disk_type: link.type,
      },
    ])

    if (resp.results && resp.results.length > 0) {
      const res = resp.results[0]
      checkResults.value[link.url] = res
      checkingStatus.value[link.url] = 'done'
    } else {
      checkingStatus.value[link.url] = 'error'
    }
  } catch {
    checkingStatus.value[link.url] = 'error'
    showToast('链接检测失败，请重试', 'error')
  }
}

async function batchCheckVisibleLinks() {
  if (batchChecking.value) return
  const supported = ['aliyun', 'quark', 'uc', 'baidu', 'tianyi', '123', 'xunlei', '115', 'mobile']

  // 抓取当前可见前 10 条待检测的链接
  const toCheck: Link[] = []
  for (const item of filteredResults.value) {
    for (const link of item.links || []) {
      if (
        supported.includes((link.type || '').toLowerCase()) &&
        !checkResults.value[link.url] &&
        checkingStatus.value[link.url] !== 'checking'
      ) {
        toCheck.push(link)
        if (toCheck.length >= 10) break
      }
    }
    if (toCheck.length >= 10) break
  }

  if (toCheck.length === 0) {
    showToast('前排支持检测的链接已全部检测完毕', 'info')
    return
  }

  batchChecking.value = true
  for (const l of toCheck) {
    checkingStatus.value[l.url] = 'checking'
  }

  try {
    const resp = await checkLinks(
      toCheck.map((l) => ({
        url: l.url,
        password: l.password,
        disk_type: l.type,
      }))
    )

    if (resp.results) {
      for (const r of resp.results) {
        checkResults.value[r.url] = r
        checkingStatus.value[r.url] = 'done'
      }
      showToast(`已完成 ${resp.results.length} 条链接存活检测`, 'success')
    }
  } catch {
    showToast('批量检测失败', 'error')
    for (const l of toCheck) {
      checkingStatus.value[l.url] = 'error'
    }
  } finally {
    batchChecking.value = false
  }
}

function handleLoginSuccess() {
  // 如果之前搜索因未登录导致无结果，登录成功后重新触发搜索
  if (currentKeyword.value.trim() && hasSearched.value && displayResults.value.length === 0) {
    handleSearch({
      keyword: currentKeyword.value,
      refresh: false,
      source: settings.value.sourceType,
    })
  }
}

onMounted(async () => {
  // 监听全局未授权事件
  window.addEventListener('pansou:auth-required', () => {
    showLoginModal.value = true
  })

  // 静默探测后端健康状态
  try {
    const health = await checkHealth()
    setBackendAuthEnabled(health.auth_enabled)
  } catch {
    // 忽略初次探活异常
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>
