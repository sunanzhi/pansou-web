<template>
  <div class="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group">
    <!-- 头部信息：标题、来源、时间 -->
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
      <h3 class="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 leading-snug break-words group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {{ result.title || '未命名资源' }}
      </h3>

      <div class="flex items-center gap-2 shrink-0 text-xs">
        <!-- 来源徽章 -->
        <span
          class="px-2 py-0.5 rounded-md font-medium border"
          :class="[
            isTgSource
              ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/50'
              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50',
          ]"
        >
          {{ isTgSource ? 'TG频道' : '扩展插件' }}: {{ result.channel }}
        </span>

        <!-- 时间 -->
        <span v-if="result.datetime" class="text-slate-400 dark:text-slate-500">
          {{ formatDate(result.datetime) }}
        </span>
      </div>
    </div>

    <!-- 正文简介或内容预览（如果有且不等于标题） -->
    <p
      v-if="result.content && result.content !== result.title"
      class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed"
    >
      {{ result.content }}
    </p>

    <!-- 链接列表 -->
    <div class="flex flex-col gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
      <div
        v-for="(link, idx) in result.links"
        :key="idx"
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 text-xs sm:text-sm transition-colors"
      >
        <!-- 左侧：网盘类型、链接地址、密码 -->
        <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap min-w-0">
          <!-- 网盘图标/标签 -->
          <span
            class="px-2 py-0.5 rounded-md font-semibold text-xs shrink-0 border"
            :class="[
              getMeta(link.type).bgColor,
              getMeta(link.type).darkBgColor,
              getMeta(link.type).color,
              getMeta(link.type).borderColor,
            ]"
          >
            {{ getMeta(link.type).label }}
          </span>

          <!-- 链接截断显示 -->
          <span class="font-mono text-slate-700 dark:text-slate-300 truncate max-w-xs sm:max-w-md" :title="link.url">
            {{ link.url }}
          </span>

          <!-- 提取码标签 -->
          <span
            v-if="link.password"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-mono text-xs border border-amber-200 dark:border-amber-800/60 shrink-0"
            title="提取码"
          >
            码: {{ link.password }}
          </span>
        </div>

        <!-- 右侧：检测状态与操作按钮 -->
        <div class="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <!-- 存活检测状态/按钮 -->
          <div class="flex items-center">
            <!-- 正在检测 -->
            <button
              v-if="checkingStatus[link.url] === 'checking'"
              disabled
              class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 text-xs cursor-wait"
            >
              <Loader2 class="w-3 h-3 animate-spin" />
              <span>检测中</span>
            </button>

            <!-- 已有检测结果 -->
            <div
              v-else-if="checkResults[link.url]"
              class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border"
              :class="getStatusBadgeClass(checkResults[link.url].state)"
              :title="checkResults[link.url].summary || checkResults[link.url].state"
            >
              <CheckCircle2 v-if="checkResults[link.url].state === 'ok'" class="w-3.5 h-3.5 text-emerald-500" />
              <XCircle v-else-if="checkResults[link.url].state === 'bad'" class="w-3.5 h-3.5 text-rose-500" />
              <Key v-else-if="checkResults[link.url].state === 'locked'" class="w-3.5 h-3.5 text-amber-500" />
              <HelpCircle v-else class="w-3.5 h-3.5 text-slate-400" />
              <span>{{ getStatusLabel(checkResults[link.url].state) }}</span>
            </div>

            <!-- 未检测：显示检测按钮 (仅对支持检测的网盘显示) -->
            <button
              v-else-if="supportsCheck(link.type)"
              type="button"
              @click="handleCheckLink(link)"
              class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 text-xs transition-colors"
              title="探测链接是否被取消分享或失效"
            >
              <Activity class="w-3 h-3" />
              <span>检测有效性</span>
            </button>
          </div>

          <!-- 复制全部信息 (链接 + 密码) -->
          <button
            type="button"
            @click="copyLinkInfo(link)"
            class="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            title="复制链接和提取码"
          >
            <Copy class="w-3.5 h-3.5" />
          </button>

          <!-- 直达网盘按钮 -->
          <a
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-sm"
          >
            <span>直达</span>
            <ExternalLink class="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
  Key,
  HelpCircle,
  Loader2,
  Activity,
} from '@lucide/vue'
import type { SearchResult, Link, CheckResult, CheckState } from '@/types'
import { getCloudTypeMeta } from '@/utils/cloudTypes'
import { showToast } from '@/utils/toast'

const props = defineProps<{
  result: SearchResult
  checkResults: Record<string, CheckResult>
  checkingStatus: Record<string, 'checking' | 'done' | 'error'>
}>()

const emit = defineEmits<{
  (e: 'checkLink', link: Link): void
}>()

const isTgSource = computed(() => {
  const ch = (props.result.channel || '').toLowerCase()
  return (
    ch.startsWith('tg') ||
    ch.includes('channel') ||
    props.result.unique_id.includes('tg_') ||
    !ch.includes('plugin')
  )
})

function getMeta(type: string) {
  return getCloudTypeMeta(type)
}

function formatDate(dtStr: string): string {
  try {
    const d = new Date(dtStr)
    if (isNaN(d.getTime())) return dtStr
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day} ${h}:${min}`
  } catch {
    return dtStr
  }
}

function supportsCheck(diskType: string): boolean {
  const supported = ['aliyun', 'quark', 'uc', 'baidu', 'tianyi', '123', 'xunlei', '115', 'mobile']
  return supported.includes((diskType || '').toLowerCase())
}

function getStatusLabel(state: CheckState): string {
  switch (state) {
    case 'ok':
      return '有效'
    case 'bad':
      return '失效'
    case 'locked':
      return '需密码'
    case 'unsupported':
      return '不支持'
    default:
      return '未知'
  }
}

function getStatusBadgeClass(state: CheckState): string {
  switch (state) {
    case 'ok':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    case 'bad':
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    case 'locked':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
  }
}

function handleCheckLink(link: Link) {
  emit('checkLink', link)
}

function copyLinkInfo(link: Link) {
  const content = link.password ? `${link.url} 提取码: ${link.password}` : link.url
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(content).then(
      () => showToast('链接已复制到剪贴板', 'success'),
      () => fallbackCopy(content)
    )
  } else {
    fallbackCopy(content)
  }
}

function fallbackCopy(text: string) {
  const input = document.createElement('textarea')
  input.value = text
  document.body.appendChild(input)
  input.select()
  try {
    document.execCommand('copy')
    showToast('链接已复制到剪贴板', 'success')
  } catch {
    showToast('复制失败，请手动长按复制', 'error')
  }
  document.body.removeChild(input)
}
</script>
