<template>
  <div class="w-full max-w-3xl mx-auto flex flex-col items-center">
    <!-- 搜索输入框表单 -->
    <form @submit.prevent="handleSubmit" class="w-full relative group">
      <div
        class="flex items-center w-full h-14 sm:h-16 px-4 sm:px-5 rounded-2xl bg-white dark:bg-slate-900 border-2 transition-all shadow-sm hover:shadow-md"
        :class="[
          isFocused
            ? 'border-emerald-500 shadow-emerald-500/10 ring-4 ring-emerald-500/10'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
        ]"
      >
        <Search class="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0 mr-3" />

        <input
          ref="inputRef"
          v-model="keyword"
          type="text"
          placeholder="搜索网盘资源、电影、剧集、动漫、音乐、电子书..."
          class="w-full h-full bg-transparent border-0 outline-none text-base sm:text-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          @focus="isFocused = true"
          @blur="isFocused = false"
        />

        <!-- 清空按钮 -->
        <button
          v-if="keyword"
          type="button"
          @click="clearKeyword"
          class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 mr-2 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>

        <!-- 搜索按钮 -->
        <button
          type="submit"
          :disabled="loading || !keyword.trim()"
          class="px-5 sm:px-7 h-10 sm:h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <span v-else>搜索</span>
        </button>
      </div>
    </form>

    <!-- 仅登录用户可见：高级过滤面板切换按钮 -->
    <div v-if="isLoggedIn" class="w-full flex items-center justify-between mt-2.5 px-2 text-xs">
      <button
        type="button"
        @click="showFilter = !showFilter"
        class="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1"
      >
        <Filter class="w-3.5 h-3.5" />
        <span>高级筛选</span>
        <ChevronDown class="w-3 h-3 transition-transform" :class="{ 'rotate-180': showFilter }" />
      </button>

      <label class="inline-flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
        <input type="checkbox" v-model="forceRefresh" class="rounded text-emerald-600 focus:ring-emerald-500" />
        <span>强制刷新 (绕过缓存)</span>
      </label>
    </div>

    <!-- 展开的高级筛选面板 (仅已登录) -->
    <div
      v-if="isLoggedIn && showFilter"
      class="w-full mt-2 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-sm transition-all"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-medium text-slate-600 dark:text-slate-300 mb-1">包含关键词 (逗号分隔，OR关系)</label>
          <input
            v-model="includeWords"
            type="text"
            placeholder="例如: 1080p, 4K, 完结"
            class="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block font-medium text-slate-600 dark:text-slate-300 mb-1">排除关键词 (逗号分隔，AND关系)</label>
          <input
            v-model="excludeWords"
            type="text"
            placeholder="例如: 预告, 枪版, 压缩包"
            class="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
          />
        </div>
      </div>
      <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <span class="text-slate-500 font-medium">搜索来源:</span>
          <label class="inline-flex items-center gap-1 cursor-pointer">
            <input type="radio" value="all" v-model="selectedSource" class="text-emerald-600 focus:ring-emerald-500" />
            <span>全网聚合</span>
          </label>
          <label class="inline-flex items-center gap-1 cursor-pointer">
            <input type="radio" value="tg" v-model="selectedSource" class="text-emerald-600 focus:ring-emerald-500" />
            <span>仅TG频道</span>
          </label>
          <label class="inline-flex items-center gap-1 cursor-pointer">
            <input type="radio" value="plugin" v-model="selectedSource" class="text-emerald-600 focus:ring-emerald-500" />
            <span>仅扩展插件</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 搜索历史记录标签 -->
    <div v-if="searchHistory.length > 0" class="w-full flex flex-wrap items-center gap-2 mt-4 px-1">
      <span class="text-xs text-slate-400 dark:text-slate-500">历史搜索:</span>
      <div
        v-for="item in searchHistory"
        :key="item"
        @click="pickHistory(item)"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition-colors"
      >
        <span>{{ item }}</span>
      </div>
      <button
        type="button"
        @click="clearHistory"
        class="text-xs text-slate-400 hover:text-rose-500 transition-colors ml-auto flex items-center gap-1 py-1"
        title="清空历史"
      >
        <Trash2 class="w-3 h-3" />
        <span>清空</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Search, X, Loader2, Filter, ChevronDown, Trash2 } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps<{
  loading?: boolean
  modelValue?: string
}>()

const emit = defineEmits<{
  (
    e: 'search',
    payload: {
      keyword: string
      refresh: boolean
      source: 'all' | 'tg' | 'plugin'
      include?: string[]
      exclude?: string[]
    }
  ): void
  (e: 'update:modelValue', value: string): void
}>()

const { isLoggedIn } = useAuthStore()
const { settings } = useSettingsStore()

const keyword = ref(props.modelValue || '')
const isFocused = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

// 筛选状态
const showFilter = ref(false)
const forceRefresh = ref(false)
const selectedSource = ref<'all' | 'tg' | 'plugin'>(settings.value.sourceType || 'all')
const includeWords = ref(settings.value.defaultIncludeWords || '')
const excludeWords = ref(settings.value.defaultExcludeWords || '')

// 搜索历史存储
const HISTORY_KEY = 'pansou_search_history'
const searchHistory = ref<string[]>([])

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (raw) {
      searchHistory.value = JSON.parse(raw)
    }
  } catch {
    searchHistory.value = []
  }
}

function saveHistory(item: string) {
  const trimmed = item.trim()
  if (!trimmed) return
  const list = [trimmed, ...searchHistory.value.filter((h) => h !== trimmed)].slice(0, 10)
  searchHistory.value = list
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Failed to save search history', e)
  }
}

function clearHistory() {
  searchHistory.value = []
  localStorage.removeItem(HISTORY_KEY)
}

function clearKeyword() {
  keyword.value = ''
  emit('update:modelValue', '')
  inputRef.value?.focus()
}

function pickHistory(item: string) {
  keyword.value = item
  emit('update:modelValue', item)
  handleSubmit()
}

function handleSubmit() {
  const kw = keyword.value.trim()
  if (!kw) return

  saveHistory(kw)

  const inc = includeWords.value
    ? includeWords.value
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined

  const exc = excludeWords.value
    ? excludeWords.value
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined

  emit('search', {
    keyword: kw,
    refresh: forceRefresh.value,
    source: selectedSource.value,
    include: inc,
    exclude: exc,
  })
}

watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined && val !== keyword.value) {
      keyword.value = val
    }
  }
)

onMounted(() => {
  loadHistory()
})
</script>
