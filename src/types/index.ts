export interface FilterConfig {
  include?: string[]
  exclude?: string[]
}

export interface SearchRequest {
  kw: string
  channels?: string[]
  conc?: number
  refresh?: boolean
  res?: 'all' | 'results' | 'merge'
  src?: 'all' | 'tg' | 'plugin'
  plugins?: string[]
  ext?: Record<string, unknown>
  cloud_types?: string[]
  filter?: FilterConfig
}

export interface Link {
  type: string
  url: string
  password?: string
  datetime?: string
  work_title?: string
}

export interface SearchResult {
  message_id: string
  unique_id: string
  channel: string
  datetime: string
  title: string
  content: string
  links: Link[]
  tags?: string[]
  images?: string[]
}

export interface MergedLink {
  url: string
  password?: string
  note?: string
  datetime: string
  source?: string
  images?: string[]
}

export type MergedLinks = Record<string, MergedLink[]>

export interface SearchResponseData {
  total: number
  results?: SearchResult[]
  merged_by_type?: MergedLinks
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data?: T
}

export interface CheckItem {
  url: string
  password?: string
  disk_type?: string
}

export type CheckState = 'ok' | 'bad' | 'locked' | 'unsupported' | 'uncertain'

export interface CheckResult {
  url: string
  disk_type: string
  state: CheckState
  summary: string
  expires_at?: number
}

export interface CheckResponse {
  results: CheckResult[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  expires_at: number
  username: string
}

export interface HealthInfo {
  status: string
  auth_enabled: boolean
  plugins_enabled: boolean
  channels?: string[]
  channels_count?: number
  plugin_count?: number
  plugins?: string[]
}

export interface UserSession {
  token: string
  username: string
  expiresAt: number
}

export interface AppSettings {
  apiBaseUrl: string
  sourceType: 'all' | 'tg' | 'plugin'
  resultType: 'all' | 'merge' | 'results'
  concurrency: number
  autoCheckTopLinks: boolean
  defaultIncludeWords: string
  defaultExcludeWords: string
  theme: 'dark' | 'light' | 'system'
  enabledChannels?: string[]
  enabledPlugins?: string[]
}
