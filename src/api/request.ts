import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import type { ApiResponse } from '../types/api'

const service: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 8000,
})

// 请求拦截器：自动附加 Authorization
service.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
})

// 响应拦截器：统一处理 401
service.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
        return response
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default service
