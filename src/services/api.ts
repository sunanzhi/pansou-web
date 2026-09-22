import type {
  SearchRequest,
  SearchResponseData,
  CheckItem,
  CheckResponse,
  LoginRequest,
  LoginResponse,
  HealthInfo,
} from '@/types'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

export class AuthRequiredError extends Error {
  constructor(message = '需要登录以使用此功能') {
    super(message)
    this.name = 'AuthRequiredError'
  }
}

export class ApiError extends Error {
  statusCode: number
  constructor(message: string, statusCode = 500) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

function getBaseUrl(): string {
  const { settings } = useSettingsStore()
  const custom = (settings.value.apiBaseUrl || '').trim()
  if (custom) {
    // 移除末尾斜杠
    return custom.replace(/\/+$/, '')
  }
  return ''
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { token, logout } = useAuthStore()
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token.value) {
    headers['Authorization'] = `Bearer ${token.value}`
  }

  let res: Response
  try {
    res = await fetch(url, {
      ...options,
      headers,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : '网络请求失败，请检查网络或后端地址'
    throw new ApiError(errorMsg, 0)
  }

  if (res.status === 401) {
    logout()
    // 触发全局登录弹窗通知
    window.dispatchEvent(new CustomEvent('pansou:auth-required'))
    throw new AuthRequiredError()
  }

  if (!res.ok) {
    let errMsg = `请求失败 (${res.status})`
    try {
      const errJson = await res.json()
      errMsg = errJson.message || errJson.error || errMsg
    } catch {
      // 保持默认错误信息
    }
    throw new ApiError(errMsg, res.status)
  }

  return (await res.json()) as T
}

export async function checkHealth(): Promise<HealthInfo> {
  return request<HealthInfo>('/api/health', { method: 'GET' })
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function verifyToken(): Promise<boolean> {
  try {
    await request('/api/auth/verify', { method: 'POST' })
    return true
  } catch {
    return false
  }
}

export async function search(params: SearchRequest): Promise<SearchResponseData> {
  // PanSou 后端支持 POST /api/search
  interface WrappedResponse {
    code?: number
    message?: string
    data?: SearchResponseData
    total?: number
    results?: SearchResponseData['results']
    merged_by_type?: SearchResponseData['merged_by_type']
  }

  const raw = await request<WrappedResponse>('/api/search', {
    method: 'POST',
    body: JSON.stringify(params),
  })

  // 如果后端包装在 data 字段中
  if (raw.data && typeof raw.data === 'object') {
    return raw.data
  }

  // 如果是直接扁平返回
  return {
    total: raw.total ?? (raw.results ? raw.results.length : 0),
    results: raw.results || [],
    merged_by_type: raw.merged_by_type || {},
  }
}

export async function checkLinks(items: CheckItem[], proxyURL?: string): Promise<CheckResponse> {
  return request<CheckResponse>('/api/check/links', {
    method: 'POST',
    body: JSON.stringify({
      items,
      proxy_url: proxyURL || '',
    }),
  })
}
