// src/api/request.ts
// 使用 axios + 支持 httpOnly cookie（后端配合设置）
// 前端不再手动管理 token，改为读取后端 user/me 接口获取用户信息

import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import type { ApiResponse } from '../types/api'
import JSONBig from 'json-bigint'

// 401 未授权回调，由路由守卫设置
let onUnauthorized: (() => void) | null = null
export const setOnUnauthorized = (fn: (() => void) | null) => {
    onUnauthorized = fn;
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
    (error: AxiosError<ApiResponse<unknown>>) => {
        const status = error.response?.status
        if (status === 401) {
            // token 过期或无效，调用回调处理（避免硬编码 window.location）
            if (onUnauthorized) onUnauthorized();
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
export const fetchCurrentUser = async (): Promise<{ data: unknown; isNetworkError: boolean } | null> => {
    try {
        const res = await service.get<unknown>('/user/me')
        return { data: res.data, isNetworkError: false }
    } catch (err) {
        const status = (err as AxiosError | undefined)?.response?.status
        if (status === 401) return null  // 未认证
        return { data: null, isNetworkError: true }  // 网络错误
    }
}
