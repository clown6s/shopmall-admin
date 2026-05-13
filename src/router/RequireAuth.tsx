// src/router/RequireAuth.tsx
// 路由守卫：验证 token 有效性（不再依赖 localStorage）
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { fetchCurrentUser, setOnUnauthorized } from '../api/request'
import { CircularProgress, Box, Typography, Button } from '@mui/material'
import useUserStore from '../store/useUserStore'

// session 级缓存：10 秒内不重复请求（TTL 不宜过长，避免退出后缓存误放行）
const CACHE_TTL = 10_000
let lastValidTime = 0
let cachedResult: boolean | null = null

export function invalidateAuthCache() {
    lastValidTime = 0
    cachedResult = null
}

export default function RequireAuth() {
    const navigate = useNavigate()
    const [isValidating, setIsValidating] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [networkError, setNetworkError] = useState(false)
    const [retryCount, setRetryCount] = useState(0)
    const setUserInfo = useUserStore((s) => s.setUserInfo)
    const fetchMenuPaths = useUserStore((s) => s.fetchMenuPaths)

    // 设置 401 未授权回调
    useEffect(() => {
        setOnUnauthorized(() => {
            invalidateAuthCache()
            useUserStore.setState({ userInfo: null })
            navigate('/login', { replace: true })
        })
        return () => setOnUnauthorized(null)
    }, [navigate])

    useEffect(() => {
        let cancelled = false

        const now = Date.now()
        // 使用缓存，避免高频导航重复请求
        if (cachedResult !== null && now - lastValidTime < CACHE_TTL) {
            if (!cancelled) {
                setIsAuthenticated(cachedResult)
                setIsValidating(false)
            }
            return
        }

        const validate = async () => {
            const result = await fetchCurrentUser()
            if (result === null) {
                // 401 - 未认证
                if (!cancelled) {
                    cachedResult = false
                    lastValidTime = Date.now()
                    setIsAuthenticated(false)
                    setIsValidating(false)
                }
                return
            }
            if (result.isNetworkError) {
                // 网络错误 - 显示错误状态
                if (!cancelled) {
                    setNetworkError(true)
                    setIsValidating(false)
                }
                return
            }
            if (!cancelled) {
                // 同步用户信息到 store
                if (result.data && typeof result.data === 'object' && 'id' in (result.data as object)) {
                    setUserInfo(result.data as Parameters<typeof setUserInfo>[0])
                    cachedResult = true
                    // 获取菜单权限路径，用于侧边栏过滤
                    fetchMenuPaths()
                } else {
                    cachedResult = false
                }
                lastValidTime = Date.now()
                setIsAuthenticated(cachedResult)
                setIsValidating(false)
            }
        }
        validate()
        return () => { cancelled = true }
    }, [setUserInfo, fetchMenuPaths, navigate, retryCount])

    if (isValidating) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (networkError) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 2 }}>
                <Typography color="error">网络连接失败，请检查网络后重试</Typography>
                <Button variant="contained" onClick={() => { setNetworkError(false); invalidateAuthCache(); setRetryCount(c => c + 1) }}>重试</Button>
            </Box>
        )
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
