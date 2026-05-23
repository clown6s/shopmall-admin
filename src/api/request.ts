// src/api/request.ts
// 使用 axios + 支持 httpOnly cookie（后端配合设置）
// 前端不再手动管理 token，改为读取后端 user/me 接口获取用户信息

import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import type { ApiResponse } from '../types/api'

import JSONBig from 'json-bigint'

// 401 未授权回调，由路由守卫设置（刷新 token 也失败时才触发）
let onUnauthorized: (() => void) | null = null
export const setOnUnauthorized = (fn: (() => void) | null) => {
    onUnauthorized = fn;
}

// --- Refresh Token 逻辑 ---
let isRefreshing = false
// P2#56: 简化 resolve 签名，去掉冗余的 token 参数
let pendingRequests: Array<{
    resolve: () => void
    reject: (err: unknown) => void
}> = []

function onRefreshSuccess() {
    pendingRequests.forEach(({ resolve }) => resolve())
    pendingRequests = []
}

function onRefreshFailure(err: unknown) {
    pendingRequests.forEach(({ reject }) => reject(err))
    pendingRequests = []
    if (onUnauthorized) onUnauthorized()
}

/**
 * 尝试用 refresh_token cookie 换取新的 access token。
 * 后端 POST /auth/refresh 会设置新的 auth_token cookie，
 * 所以刷新成功后不需要前端手动保存 token。
 */
async function tryRefreshToken(): Promise<boolean> {
    try {
        const csrfToken = await ensureCSRFToken()
        const res = await axios.post('/api/auth/refresh', null, {
            headers: csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : undefined,
            withCredentials: true,
            timeout: 5000,
        })
        return res.status === 200
    } catch (err) {
        if (import.meta.env.DEV) {
            console.error('[API] tryRefreshToken 失败:', (err as AxiosError)?.response?.status, err instanceof Error ? err.message : String(err))
        }
        return false
    }
}

async function ensureCSRFToken(): Promise<string | null> {
    const existing = getCSRFToken()
    if (existing) return existing

    try {
        await axios.get('/api/csrf/token', {
            withCredentials: true,
            timeout: 5000,
        })
    } catch {
        return null
    }

    return getCSRFToken()
}

// json-bigint 配置 alwaysParseAsBig: true，将所有整数解析为 BigInt。
// BigInt 在 bigintToString 中根据 key 名区分处理：
//   - ID 类字段（含 Id/id、Count、Total、Page、Size）→ 转为 string（int64 兼容）
//   - 其他数值字段（gender、status 等）→ 转回 number（保持原类型）
function bigintToString(data: unknown, parentKey?: string): unknown {
    if (typeof data === 'bigint') {
        if (isIdKey(parentKey)) return data.toString()
        return Number(data)
    }
    if (data === null || typeof data !== 'object') return data
    if (Array.isArray(data)) return data.map((item) => bigintToString(item, parentKey))
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(data)) {
        result[key] = bigintToString((data as Record<string, unknown>)[key], key)
    }
    return result
}

// 判断 key 是否为 ID 类字段，这类字段对应后端 int64，应转为 string
// 匹配: xxxId, xxxID, xxxCount (计数类), xxxNum, xxxQuantity, xxxNumber
// 不匹配: page, pageSize, total (分页元数据保持 number)
const ID_KEY_PATTERN = /(?:[Ii]d|ID|Count|Num|Quantity|Number)$/i
function isIdKey(key?: string): boolean {
    if (!key) return false
    if (/^(page|pageSize|total)$/i.test(key)) return false
    return ID_KEY_PATTERN.test(key)
}

const service: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 8000,
    // 允许接收 httpOnly cookie
    withCredentials: true,
    // 用 json-bigint 解析响应，解决大数字精度丢失问题
    transformResponse: [
        (data) => {
            if (!data) return data
            try {
                const parsed = JSONBig({ useNativeBigInt: true, alwaysParseAsBig: true }).parse(data)
                return bigintToString(parsed)
            } catch {
                return data
            }
        },
    ],
})

// 请求拦截器：不再手动附加 Authorization header
// httpOnly cookie 由浏览器自动携带
// 同时添加 CSRF token（从 cookie 读取 xsrf-token）
service.interceptors.request.use((config) => {
    // 仅对 state-changing 请求添加 CSRF token
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
        const csrfToken = getCSRFToken()
        if (csrfToken) {
            config.headers['X-XSRF-TOKEN'] = csrfToken
        } else {
            // 安全措施：CSRF token 缺失时阻止写操作请求（DEV 环境仅警告放行）
            if (import.meta.env.DEV) {
                console.warn('[CSRF] xsrf-token cookie missing for', config.method, config.url)
            } else {
                console.error('[CSRF] xsrf-token cookie missing, blocking write request:', config.method, config.url)
                return Promise.reject(new Error('CSRF token 缺失，请刷新页面重试'))
            }
        }
    }
    return config
})

// 响应拦截器：统一处理 401 + 后端业务错误
service.interceptors.response.use(
    (response: AxiosResponse) => {
        const data = response.data

        // 如果返回的是纯数组（无 code 字段），直接返回整个 response
        if (Array.isArray(data)) {
            return response
        }

        // 包装格式 { code, message, data }
        const r = data as ApiResponse<unknown>
        if (r.code !== undefined) {
            if (r.code !== 200) {
                const error = new Error(r.message || '请求失败') as AxiosError<ApiResponse<unknown>>
                error.response = response
                error.config = response.config
                return Promise.reject(error)
            }
            // 有 data 字段时自动提取，让 res.data 直接是业务数据
            if (r.data !== undefined) {
                return { ...response, data: r.data }
            }
        }

        return response
    },
    async (error: AxiosError<ApiResponse<unknown>>) => {
        const status = error.response?.status
        const originalRequest = error.config

        if (status === 401 && originalRequest) {
            // 对 /auth/refresh 本身返回 401，直接走未授权逻辑
            if (originalRequest.url === '/auth/refresh') {
                onRefreshFailure(error)
                return Promise.reject(error)
            }

            // 已有刷新请求在进行中，排队等待
            if (isRefreshing) {
                return new Promise<AxiosResponse>((resolve, reject) => {
                    pendingRequests.push({
                        resolve: () => resolve(service(originalRequest!)),
                        reject: (err) => reject(err),
                    })
                })
            }

            isRefreshing = true
            try {
                const ok = await tryRefreshToken()

                if (ok) {
                    // 后端已通过 Set-Cookie 设置了新的 auth_token，直接重试原请求
                    onRefreshSuccess()
                    return service(originalRequest)
                } else {
                    // refresh token 也过期了，走登出逻辑
                    onRefreshFailure(error)
                    return Promise.reject(error)
                }
            } finally {
                isRefreshing = false
            }
        } else if (status === 403) {
            // 权限不足，在错误消息中标记便于上层识别
            ;(error as AxiosError & { isForbidden?: boolean }).isForbidden = true
        }
        return Promise.reject(error)
    }
)

// getCSRFToken 从 Cookie 中读取 xsrf-token
function getCSRFToken(): string | null {
    const match = document.cookie.match(/(^| )xsrf-token=([^;]+)/)
    return match ? decodeURIComponent(match[2]) : null
}

export default service
