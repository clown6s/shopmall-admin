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
        typeof info.phone === 'string'
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
            const res = await loginApi(mobile, password)
            const loginData = res.data as LoginResp
            if (isEmployeeInfo(loginData?.employeeInfo)) {
                navigate('/', { replace: true })
            } else {
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
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
                position: 'relative',
                overflow: 'hidden',
                py: 4,
            }}
        >
            {/* Animated floating orbs */}
            <Box sx={{
                position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
            }}>
                {/* Orb 1 - Indigo */}
                <Box sx={{
                    position: 'absolute', top: '15%', left: '20%',
                    width: 300, height: 300, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    animation: 'floatOrb1 12s ease-in-out infinite',
                }} />
                {/* Orb 2 - Purple */}
                <Box sx={{
                    position: 'absolute', bottom: '20%', right: '15%',
                    width: 350, height: 350, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
                    filter: 'blur(70px)',
                    animation: 'floatOrb2 15s ease-in-out infinite',
                }} />
                {/* Orb 3 - Cyan accent */}
                <Box sx={{
                    position: 'absolute', top: '60%', left: '60%',
                    width: 200, height: 200, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)',
                    filter: 'blur(50px)',
                    animation: 'floatOrb3 10s ease-in-out infinite',
                }} />
                {/* Orb 4 - Pink */}
                <Box sx={{
                    position: 'absolute', top: '5%', right: '30%',
                    width: 180, height: 180, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(244,114,182,0.15) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    animation: 'floatOrb2 18s ease-in-out infinite',
                }} />
                {/* Grid pattern overlay */}
                <Box sx={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />
            </Box>

            {/* Login Card */}
            <Paper
                elevation={0}
                sx={{
                    width: 420,
                    maxWidth: '90%',
                    p: 5,
                    borderRadius: '24px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
                    position: 'relative',
                    zIndex: 1,
                    animation: 'scaleIn 0.5s ease-out',
                }}
            >
                {/* Logo & Title */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '18px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                        }}
                    >
                        <StorefrontIcon sx={{ fontSize: 32, color: '#fff' }} />
                    </Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        ShopMall Admin
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>
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
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: '#fca5a5',
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
                        autoComplete="off"
                        slotProps={{
                            htmlInput: { maxLength: 11 },
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonOutlineOutlinedIcon sx={{ color: 'rgba(255,255,255,0.3)' }} />
                                    </InputAdornment>
                                ),
                            },
                            inputLabel: { sx: { color: 'rgba(255,255,255,0.4)' } },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#e2e8f0',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                                '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                            },
                            '& input:-webkit-autofill, & input:-internal-autofill-selected, & input:-internal-autofill-previewed': {
                                WebkitBoxShadow: '0 0 0 100px rgba(255,255,255,0.05) inset !important',
                                WebkitTextFillColor: '#e2e8f0 !important',
                                caretColor: '#e2e8f0 !important',
                                transition: 'background-color 9999s ease-in-out 0s !important',
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
                                        <LockOutlinedIcon sx={{ color: 'rgba(255,255,255,0.3)' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: 'rgba(255,255,255,0.5)' } }}
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
                            inputLabel: { sx: { color: 'rgba(255,255,255,0.4)' } },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#e2e8f0',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                                '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                            },
                            '& input:-webkit-autofill, & input:-internal-autofill-selected, & input:-internal-autofill-previewed': {
                                WebkitBoxShadow: '0 0 0 100px rgba(255,255,255,0.05) inset !important',
                                WebkitTextFillColor: '#e2e8f0 !important',
                                caretColor: '#e2e8f0 !important',
                                transition: 'background-color 9999s ease-in-out 0s !important',
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
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                boxShadow: '0 10px 30px rgba(99,102,241,0.45)',
                            },
                            '&:disabled': {
                                background: 'rgba(255,255,255,0.1)',
                                boxShadow: 'none',
                                color: 'rgba(255,255,255,0.3)',
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

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem' }}>
                        Go Gin · MySQL 8.0 · Redis · JWT
                    </Typography>
                </Box>
            </Paper>
        </Box>
    )
}
