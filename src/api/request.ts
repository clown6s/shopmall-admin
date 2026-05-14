// src/api/request.ts
// 使用 axios + 支持 httpOnly cookie（后端配合设置）
// 前端不再手动管理 token，改为读取后端 user/me 接口获取用户信息

import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import type { ApiResponse } from '../types/api'
import type { UserInfo } from '../store/useUserStore'
import JSONBig from 'json-bigint'

// 401 未授权回调，由路由守卫设置（刷新 token 也失败时才触发）
let onUnauthorized: (() => void) | null = null
export const setOnUnauthorized = (fn: (() => void) | null) => {
    onUnauthorized = fn;
}

// --- Refresh Token 逻辑 ---
let isRefreshing = false
let pendingRequests: Array<{
    resolve: (token: string) => void
    reject: (err: unknown) => void
}> = []

function onRefreshSuccess(newToken: string) {
    pendingRequests.forEach(({ resolve }) => resolve(newToken))
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
        // 用独立的 axios 实例，不走拦截器，避免循环
        const res = await axios.post('/api/auth/refresh', null, {
            withCredentials: true,
            timeout: 5000,
        })
        return res.status === 200
    } catch {
        return false
    }
}

// json-bigint 使用 useNativeBigInt: true 会将大数字解析为 BigInt，
// 而 React JSX 无法渲染 BigInt（TypeError: Cannot convert object to primitive value）。
// 递归将 BigInt 转为 string 以确保前端安全使用。
function bigintToString(data: unknown): unknown {
    if (typeof data === 'bigint') return data.toString()
    if (data === null || typeof data !== 'object') return data
    if (Array.isArray(data)) return data.map(bigintToString)
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(data)) {
        result[key] = bigintToString((data as Record<string, unknown>)[key])
    }
    return result
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
                const parsed = JSONBig({ useNativeBigInt: true }).parse(data)
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
        } else if (import.meta.env.DEV) {
            console.warn('[CSRF] xsrf-token cookie not found for', config.method, config.url)
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
        if (r.code !== undefined && r.data !== undefined) {
            // 检查后端返回的业务 code，非 200 视为错误
            if (r.code !== 200) {
                const error = new Error(r.message || '请求失败') as AxiosError<ApiResponse<unknown>>
                error.response = response
                error.config = response.config
                return Promise.reject(error)
            }
            // 自动提取 data 字段，让 res.data 直接是业务数据
            return { ...response, data: r.data }
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
                    onRefreshSuccess('')
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

// 获取当前登录用户信息的工具函数
// 用于在路由守卫中验证登录状态
export const fetchCurrentUser = async (): Promise<{ data: UserInfo | null; isNetworkError: boolean } | null> => {
    try {
        const res = await service.get<UserInfo>('/user/me')
        return { data: res.data, isNetworkError: false }
    } catch (err) {
        const status = (err as AxiosError | undefined)?.response?.status
        // 401 已经被拦截器自动刷新处理过，这里不会再拿到
        if (status === 401) return null  // 未认证（refresh 也失败）
        return { data: null, isNetworkError: true }  // 网络错误
    }
}
