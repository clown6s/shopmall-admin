// src/pages/Dashboard.tsx
import { type JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import StorefrontIcon from '@mui/icons-material/Storefront'
import MapIcon from '@mui/icons-material/Map'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import DnsIcon from '@mui/icons-material/Dns'
import StorageIcon from '@mui/icons-material/Storage'
import MemoryIcon from '@mui/icons-material/Memory'
import SecurityIcon from '@mui/icons-material/Security'

interface StatCard {
    label: string
    value: string | number
    subtext?: string
    icon: JSX.Element
    gradient: string
    accentColor: string
    accentBg: string
}

export default function Dashboard(): JSX.Element {
    const navigate = useNavigate()
    const stats: StatCard[] = [
        {
            label: '商品 SPU',
            value: '—',
            subtext: '待接入数据',
            icon: <StorefrontIcon sx={{ fontSize: 24 }} />,
            gradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
            accentColor: '#6366f1',
            accentBg: 'rgba(99,102,241,0.08)',
        },
        {
            label: '行政区划',
            value: '—',
            subtext: '待接入数据',
            icon: <MapIcon sx={{ fontSize: 24 }} />,
            gradient: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
            accentColor: '#0ea5e9',
            accentBg: 'rgba(14,165,233,0.08)',
        },
        {
            label: '日活跃用户',
            value: '—',
            subtext: '待接入数据',
            icon: <TrendingUpIcon sx={{ fontSize: 24 }} />,
            gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
            accentColor: '#10b981',
            accentBg: 'rgba(16,185,129,0.08)',
        },
        {
            label: '待处理订单',
            value: '—',
            subtext: '待接入数据',
            icon: <PeopleIcon sx={{ fontSize: 24 }} />,
            gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
            accentColor: '#ec4899',
            accentBg: 'rgba(236,72,153,0.08)',
        },
    ]

    return (
        <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
            {/* ── Welcome Banner ── */}
            <Box
                sx={{
                    mb: 4,
                    p: 4,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: 'scaleIn 0.5s ease-out',
                }}
            >
                {/* Decorative orbs */}
                <Box sx={{
                    position: 'absolute', top: '-30%', right: '-5%',
                    width: 200, height: 200, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    filter: 'blur(40px)',
                }} />
                <Box sx={{
                    position: 'absolute', bottom: '-40%', right: '15%',
                    width: 160, height: 160, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    filter: 'blur(30px)',
                }} />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>
                        欢迎回来 👋
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: 480 }}>
                        ShopMall 管理系统 — 实时掌控商品、用户与订单数据
                    </Typography>
                </Box>
            </Box>

            {/* ── Stats Cards ── */}
            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Card
                            elevation={0}
                            sx={{
                                height: '100%',
                                borderRadius: '16px',
                                border: '1px solid var(--border-light)',
                                background: '#fff',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: `0 8px 30px ${stat.accentColor}15`,
                                    borderColor: `${stat.accentColor}30`,
                                },
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: 3,
                                    background: stat.gradient,
                                    borderRadius: '0 0 16px 16px',
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease',
                                },
                                '&:hover::after': {
                                    opacity: 1,
                                },
                                animation: `slideUp 0.5s ease-out ${index * 0.08}s both`,
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            sx={{ mb: 1.5, fontWeight: 500, color: '#64748b', fontSize: '0.8rem' }}
                                        >
                                            {stat.label}
                                        </Typography>
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                fontWeight: 700,
                                                mb: 1.5,
                                                fontSize: '1.85rem',
                                                color: '#1e293b',
                                                letterSpacing: '-0.02em',
                                            }}
                                        >
                                            {stat.value}
                                        </Typography>
                                        {stat.subtext && (
                                            <Chip
                                                label={stat.subtext}
                                                size="small"
                                                sx={{
                                                    height: 22,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 500,
                                                    background: stat.accentBg,
                                                    color: stat.accentColor,
                                                }}
                                            />
                                        )}
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '14px',
                                            background: stat.accentBg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: stat.accentColor,
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {stat.icon}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* ── System Info & Quick Actions ── */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* System Info */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: '16px',
                            border: '1px solid var(--border-light)',
                            background: '#fff',
                            height: '100%',
                            animation: 'slideUp 0.5s ease-out 0.4s both',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <Box sx={{
                                    width: 36, height: 36, borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <DnsIcon sx={{ fontSize: 18, color: '#fff' }} />
                                </Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    系统信息
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {[
                                    { label: '后端框架', value: 'Go', color: '#00acd7', icon: <MemoryIcon sx={{ fontSize: 16 }} /> },
                                    { label: '数据库', value: 'MySQL', color: '#4479a1', icon: <StorageIcon sx={{ fontSize: 16 }} /> },
                                    { label: '缓存', value: 'Redis', color: '#dc382d', icon: <MemoryIcon sx={{ fontSize: 16 }} /> },
                                    { label: '认证方式', value: 'Token + Cookie', color: '#8b5cf6', icon: <SecurityIcon sx={{ fontSize: 16 }} /> },
                                ].map((item) => (
                                    <Box
                                        key={item.label}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            borderRadius: '10px',
                                            background: '#f8fafc',
                                            transition: 'all 0.2s ease',
                                            '&:hover': { background: '#f1f5f9' },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ color: item.color }}>{item.icon}</Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                                {item.label}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={item.value}
                                            size="small"
                                            sx={{
                                                height: 24,
                                                fontSize: '0.72rem',
                                                fontWeight: 600,
                                                background: `${item.color}10`,
                                                color: item.color,
                                                border: `1px solid ${item.color}20`,
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Quick Actions */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: '16px',
                            border: '1px solid var(--border-light)',
                            background: '#fff',
                            height: '100%',
                            animation: 'slideUp 0.5s ease-out 0.5s both',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <Box sx={{
                                    width: 36, height: 36, borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <TrendingUpIcon sx={{ fontSize: 18, color: '#fff' }} />
                                </Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    快捷操作
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {[
                                    { label: '用户管理', desc: '查看和管理系统用户', path: '/system/employee', gradient: 'linear-gradient(135deg, #818cf8, #6366f1)' },
                                    { label: '商品管理', desc: '管理商品信息和分类', path: '/product', gradient: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' },
                                    { label: '部门管理', desc: '组织架构与部门设置', path: '/system/department', gradient: 'linear-gradient(135deg, #34d399, #10b981)' },
                                ].map((item) => (
                                    <Box
                                        key={item.label}
                                        role="button"
                                        tabIndex={0}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2.5,
                                            borderRadius: '12px',
                                            background: '#f8fafc',
                                            cursor: 'pointer',
                                            transition: 'all 0.25s ease',
                                            border: '1px solid transparent',
                                            '&:hover': {
                                                background: '#fff',
                                                borderColor: 'var(--border-light)',
                                                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                                                transform: 'translateX(4px)',
                                                '& .action-arrow': {
                                                    opacity: 1,
                                                    transform: 'translateX(0)',
                                                },
                                            },
                                        }}
                                        onClick={() => navigate(item.path)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                navigate(item.path)
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                background: item.gradient,
                                                boxShadow: '0 0 8px rgba(99,102,241,0.3)',
                                            }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                    {item.label}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                    {item.desc}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <ArrowForwardIcon
                                            className="action-arrow"
                                            sx={{
                                                fontSize: 18,
                                                color: '#94a3b8',
                                                opacity: 0,
                                                transform: 'translateX(-4px)',
                                                transition: 'all 0.25s ease',
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )
}
