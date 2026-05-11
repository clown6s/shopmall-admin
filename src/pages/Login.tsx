// src/pages/Login.tsx
import { type JSX, useState } from 'react'
import {
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Paper,
    Divider,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { loginApi } from '../api/employee'
import type { EmployeeInfo, LoginResp } from '../types/employee'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { isValidPhone } from '../utils/validators'

/** 运行时校验 EmployeeInfo 结构完整性 */
function isEmployeeInfo(data: unknown): data is EmployeeInfo {
    if (!data || typeof data !== 'object') return false
    const info = data as Record<string, unknown>
    return (
        typeof info.id === 'number' &&
        typeof info.realName === 'string' &&
        typeof info.phone === 'string' &&
        typeof info.role === 'string'
    )
}

export default function Login(): JSX.Element {
    const navigate = useNavigate()

    const [mobile, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async () => {
        setError('')
        if (!mobile || !password) {
            setError('手机号和密码不能为空')
            return
        }
        if (!isValidPhone(mobile)) {
            setError('手机号格式不正确')
            return
        }
        try {
            setLoading(true)
            // 注意：request.ts 响应拦截器已自动解包 { code, data }
            // res.data 直接就是 LoginResp（内层 data），不再有 code 字段
            const res = await loginApi(mobile, password)
            const loginData = res.data as LoginResp
            if (isEmployeeInfo(loginData?.employeeInfo)) {
                // 登录成功，直接导航，让 RequireAuth 统一处理用户信息加载
                navigate('/', { replace: true })
            } else {
                // 后端返回了非 200 的 code，拦截器会抛错走 catch
                // 如果走到这里说明 data 结构异常
                setError('登录响应异常，请联系管理员')
            }
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? '登录失败，请检查手机号或密码'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleLogin()
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'relative',
                overflowY: 'auto',
                py: 4,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%)',
                },
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: 420,
                    maxWidth: '90%',
                    p: 5,
                    borderRadius: '24px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    zIndex: 1,
                    animation: 'slideUp 0.5s ease-out',
                }}
            >
                {/* Logo & Title */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                        sx={{
                            width: 72,
                            height: 72,
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                        }}
                    >
                        <StorefrontIcon sx={{ fontSize: 36, color: '#fff' }} />
                    </Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1,
                        }}
                    >
                        ShopMall Admin
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        欢迎回来，请登录您的账户
                    </Typography>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            borderRadius: '12px',
                            '& .MuiAlert-icon': { color: '#ef4444' },
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* Login Form */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                        fullWidth
                        label="手机号"
                        value={mobile}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={handleKeyDown}
                        slotProps={{
                            htmlInput: { maxLength: 11 },
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonOutlineOutlinedIcon sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '14px',
                                background: '#f8fafc',
                                '& fieldset': { borderColor: '#e2e8f0' },
                                '&:hover fieldset': { borderColor: '#cbd5e1' },
                                '&.Mui-focused fieldset': { borderColor: '#667eea' },
                            },
                        }}
                    />

                    <TextField
                        fullWidth
                        label="密码"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        slotProps={{
                            htmlInput: { autoComplete: 'current-password' },
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? (
                                                <VisibilityOffOutlinedIcon fontSize="small" />
                                            ) : (
                                                <VisibilityOutlinedIcon fontSize="small" />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '14px',
                                background: '#f8fafc',
                                '& fieldset': { borderColor: '#e2e8f0' },
                                '&:hover fieldset': { borderColor: '#cbd5e1' },
                                '&.Mui-focused fieldset': { borderColor: '#667eea' },
                            },
                        }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleLogin}
                        disabled={loading}
                        sx={{
                            mt: 1,
                            py: 1.5,
                            borderRadius: '14px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
                            },
                            '&:disabled': {
                                background: '#cbd5e1',
                                boxShadow: 'none',
                            },
                        }}
                        aria-busy={loading}
                    >
                        {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <CircularProgress size={20} color="inherit" />
                                <span>登录中…</span>
                            </Box>
                        ) : (
                            '登 录'
                        )}
                    </Button>
                </Box>

                <Divider sx={{ my: 3, color: 'text.secondary', fontSize: '0.875rem' }}>
                    或使用以下方式
                </Divider>

                {/* Footer */}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        后端: Go Fiber v3 · 数据库: MySQL · 缓存: Redis
                    </Typography>
                </Box>
            </Paper>
        </Box>
    )
}
