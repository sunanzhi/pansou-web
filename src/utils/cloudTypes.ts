export interface CloudTypeMeta {
  key: string
  label: string
  color: string
  bgColor: string
  darkBgColor: string
  borderColor: string
}

export const CLOUD_TYPE_LIST: CloudTypeMeta[] = [
  {
    key: 'quark',
    label: '夸克网盘',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50',
    darkBgColor: 'dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800/60',
  },
  {
    key: 'aliyun',
    label: '阿里云盘',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50',
    darkBgColor: 'dark:bg-orange-950/40',
    borderColor: 'border-orange-200 dark:border-orange-800/60',
  },
  {
    key: 'baidu',
    label: '百度网盘',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50',
    darkBgColor: 'dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800/60',
  },
  {
    key: '115',
    label: '115网盘',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50',
    darkBgColor: 'dark:bg-indigo-950/40',
    borderColor: 'border-indigo-200 dark:border-indigo-800/60',
  },
  {
    key: 'xunlei',
    label: '迅雷云盘',
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50',
    darkBgColor: 'dark:bg-sky-950/40',
    borderColor: 'border-sky-200 dark:border-sky-800/60',
  },
  {
    key: 'mobile',
    label: '移动云盘',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50',
    darkBgColor: 'dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800/60',
  },
  {
    key: '123',
    label: '123网盘',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50',
    darkBgColor: 'dark:bg-cyan-950/40',
    borderColor: 'border-cyan-200 dark:border-cyan-800/60',
  },
  {
    key: 'tianyi',
    label: '天翼云盘',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50',
    darkBgColor: 'dark:bg-red-950/40',
    borderColor: 'border-red-200 dark:border-red-800/60',
  },
  {
    key: 'uc',
    label: 'UC网盘',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50',
    darkBgColor: 'dark:bg-yellow-950/40',
    borderColor: 'border-yellow-200 dark:border-yellow-800/60',
  },
  {
    key: 'magnet',
    label: '磁力链接',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50',
    darkBgColor: 'dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800/60',
  },
  {
    key: 'pikpak',
    label: 'PikPak',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50',
    darkBgColor: 'dark:bg-pink-950/40',
    borderColor: 'border-pink-200 dark:border-pink-800/60',
  },
  {
    key: 'guangya',
    label: '光鸭云盘',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50',
    darkBgColor: 'dark:bg-teal-950/40',
    borderColor: 'border-teal-200 dark:border-teal-800/60',
  },
  {
    key: 'others',
    label: '其他资源',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-50',
    darkBgColor: 'dark:bg-slate-900',
    borderColor: 'border-slate-200 dark:border-slate-800',
  },
]

const CLOUD_TYPE_MAP: Record<string, CloudTypeMeta> = {}
for (const item of CLOUD_TYPE_LIST) {
  CLOUD_TYPE_MAP[item.key.toLowerCase()] = item
}

export function getCloudTypeMeta(type: string): CloudTypeMeta {
  const normalized = (type || '').toLowerCase().trim()
  return (
    CLOUD_TYPE_MAP[normalized] || {
      key: normalized || 'others',
      label: normalized ? normalized.toUpperCase() : '其他',
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-100',
      darkBgColor: 'dark:bg-slate-800',
      borderColor: 'border-slate-200 dark:border-slate-700',
    }
  )
}
