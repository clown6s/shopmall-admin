// src/router/RequireAuth.tsx
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { setOnUnauthorized } from '../api/request'
import { Typography, Button } from '@mui/material'
import useUserStore, { invalidateAuthCache, getAuthCache, setAuthCacheSuccess } from '../store/useUserStore'

export default function RequireAuth() {
    const navigate = useNavigate()
    const [step, setStep] = useState('init')
    const [result, setResult] = useState('')
    const location = useLocation()
    const fetchUserInfo = useUserStore((s) => s.fetchUserInfo)
    const menuPaths = useUserStore((s) => s.menuPaths)

    useEffect(() => {
        setOnUnauthorized(() => {
            setStep('unauthorized')
            setResult('onUnauthorized triggered')
            invalidateAuthCache()
            useUserStore.setState({ userInfo: null })
            navigate('/login', { replace: true })
        })
        return () => setOnUnauthorized(null)
    }, [navigate])

    useEffect(() => {
        let cancelled = false

        const now = Date.now()
        const cache = getAuthCache()
        if (cache.cachedResult !== null && now - cache.lastValidTime < cache.CACHE_TTL) {
            setStep('cached')
            setResult(`cached: ${cache.cachedResult}`)
            return
        }

        setStep('validating')
        setResult('calling fetchUserInfo...')

        const validate = async () => {
            try {
                const ok = await fetchUserInfo()
                if (!cancelled) {
                    if (ok) setAuthCacheSuccess()
                    setStep(ok ? 'authenticated' : 'not-authenticated')
                    setResult(`fetchUserInfo returned: ${ok}`)
                }
            } catch (err) {
                if (!cancelled) {
                    setStep('error')
                    setResult(String(err))
                }
            }
        }
        validate()
        return () => { cancelled = true }
    }, [fetchUserInfo, navigate])

    // 验证完成 → 已登录
    // pathname === '/'（仪表盘首页）默认允许访问，不受 menuPaths 限制
    if (step === 'authenticated' || step === 'cached') {
        if (location.pathname !== '/') {
            const pathname = location.pathname
            // menuPaths 为空时，仅允许访问首页（后端仍有权限校验作为最终防线）
            const allowed = menuPaths.length === 0 || menuPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))
            if (!allowed) {
                return <Navigate to="/" replace />
            }
        }
        return <Outlet />
    }

    // 验证完成 → 未登录
    if (step === 'not-authenticated' || step === 'unauthorized') {
        return <Navigate to="/login" replace />
    }

    // 验证中 / 出错 → 始终显示内容，不白屏
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '100vh', background: '#0f172a',
            color: '#e2e8f0', fontFamily: 'Consolas, monospace', padding: 40,
        }}>
            <Typography sx={{ color: '#89b4fa', fontWeight: 700, fontSize: 18, mb: 2 }}>
                ShopMall Admin
            </Typography>
            <Typography sx={{ color: '#94a3b8', mb: 1 }}>
                Step: <span style={{ color: '#89b4fa' }}>{step}</span>
            </Typography>
            <Typography sx={{ color: '#64748b', mb: 3, fontSize: 13 }}>
                {result}
            </Typography>
            {step === 'error' && (
                <Button
                    variant="contained"
                    onClick={() => { invalidateAuthCache(); setStep('init') }}
                >
                    Retry
                </Button>
            )}
            <Button
                sx={{ mt: 2, color: '#64748b' }}
                onClick={() => navigate('/login')}
            >
                Go to Login
            </Button>
        </div>
    )
}
