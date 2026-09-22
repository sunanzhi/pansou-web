<template>
  <div class="w-full flex flex-wrap items-center gap-2 select-none">
    <!-- 全部标签 -->
    <button
      type="button"
      @click="$emit('select', '')"
      class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 border shadow-sm"
      :class="[
        activeKey === ''
          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm'
          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800',
      ]"
    >
      <span>全部</span>
      <span
        class="text-[11px] px-1.5 py-0.2 rounded-full font-mono"
        :class="[
          activeKey === ''
            ? 'bg-slate-800 text-slate-200 dark:bg-slate-100 dark:text-slate-800'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
        ]"
      >
        {{ totalCount }}
      </span>
    </button>

    <!-- 动态展示有结果的网盘分类 -->
    <button
      v-for="item in availableTabs"
      :key="item.key"
      type="button"
      @click="$emit('select', item.key)"
      class="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 border shadow-sm"
      :class="[
        activeKey === item.key
          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800',
      ]"
    >
      <span>{{ item.label }}</span>
      <span
        class="text-[11px] px-1.5 py-0.2 rounded-full font-mono"
        :class="[
          activeKey === item.key
            ? 'bg-emerald-700 text-white'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
        ]"
      >
        {{ item.count }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CLOUD_TYPE_LIST, getCloudTypeMeta } from '@/utils/cloudTypes'

const props = defineProps<{
  activeKey: string
  totalCount: number
  countsByType: Record<string, number>
}>()

defineEmits<{
  (e: 'select', key: string): void
}>()

const availableTabs = computed(() => {
  const result: Array<{ key: string; label: string; count: number }> = []

  // 按预设顺序检查是否有 count > 0
  for (const meta of CLOUD_TYPE_LIST) {
    const count = props.countsByType[meta.key] || 0
    if (count > 0) {
      result.push({
        key: meta.key,
        label: meta.label,
        count,
      })
    }
  }

  // 检查是否有未在预设中的其他类型
  for (const [key, count] of Object.entries(props.countsByType)) {
    if (count > 0 && !CLOUD_TYPE_LIST.some((m) => m.key === key)) {
      result.push({
        key,
        label: getCloudTypeMeta(key).label,
        count,
      })
    }
  }

  return result
})
</script>
