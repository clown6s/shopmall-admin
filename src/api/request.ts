import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import type { ApiResponse } from '../types/api'
import JSONBig from 'json-bigint'

const service: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 8000,
    // 用 json-bigint 解析响应，解决大数字精度丢失问题
    transformResponse: [
        (data) => {
            if (!data) return data
            try {
                return JSONBig({ useNativeBigInt: true }).parse(data)
            } catch {
                return data
            }
        },
    ],
})

// 请求拦截器：自动附加 Authorization
service.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
})

// 响应拦截器：统一处理 401 + 后端业务错误
service.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
        // 检查后端返回的业务 code，非 200 视为错误
        if (response.data.code !== 200) {
            const error = new Error(response.data.message || '请求失败') as AxiosError<ApiResponse<unknown>>
            error.response = response
            error.config = response.config
            return Promise.reject(error)
        }
        return response
    },
    (error: AxiosError<ApiResponse<unknown>>) => {
        if (error.response?.status === 401) {
            // 只有在已登录状态下（localStorage 有 token）才跳转
            // 登录页本身的 401 应该透传给上层展示错误提示，不能跳转
            if (localStorage.getItem('token')) {
                localStorage.removeItem('token')
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default service
