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

interface StatCard {
    label: string
    value: string | number
    subtext?: string
    icon: JSX.Element
    gradient: string
    iconBg: string
}

export default function Dashboard(): JSX.Element {
    const navigate = useNavigate()
    const stats: StatCard[] = [
        {
            label: '商品 SPU',
            value: '—',
            subtext: '待接入数据',
            icon: <StorefrontIcon sx={{ fontSize: 28 }} />,
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            iconBg: 'rgba(240, 147, 251, 0.15)',
        },
        {
            label: '行政区划',
            value: '—',
            subtext: '待接入数据',
            icon: <MapIcon sx={{ fontSize: 28 }} />,
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            iconBg: 'rgba(79, 172, 254, 0.15)',
        },
        {
            label: '日活跃用户',
            value: '—',
            subtext: '待接入数据',
            icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            iconBg: 'rgba(67, 233, 123, 0.15)',
        },
        {
            label: '待处理订单',
            value: '—',
            subtext: '待接入数据',
            icon: <PeopleIcon sx={{ fontSize: 28 }} />,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            iconBg: 'rgba(102, 126, 234, 0.15)',
        },
    ]

    return (
        <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        mb: 1,
                        background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    仪表盘
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    欢迎使用 ShopMall 管理系统，以下是今日数据概览
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Card
                            sx={{
                                height: '100%',
                                borderRadius: '20px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                                },
                                animation: `slideUp 0.5s ease-out ${index * 0.1}s both`,
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 1, fontWeight: 500 }}
                                        >
                                            {stat.label}
                                        </Typography>
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                fontWeight: 700,
                                                mb: 1,
                                                fontSize: '2.25rem',
                                            }}
                                        >
                                            {stat.value}
                                        </Typography>
                                        {stat.subtext && (
                                            <Chip
                                                label={stat.subtext}
                                                size="small"
                                                sx={{
                                                    height: 24,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    background: stat.iconBg,
                                                    color: stat.gradient.includes('667eea')
                                                        ? '#667eea'
                                                        : stat.gradient.includes('f093fb')
                                                          ? '#f5576c'
                                                          : stat.gradient.includes('4facfe')
                                                            ? '#00f2fe'
                                                            : '#38f9d7',
                                                }}
                                            />
                                        )}
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: '16px',
                                            background: stat.gradient,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            boxShadow: `0 8px 20px ${stat.iconBg}`,
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

            {/* System Info Cards */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                        sx={{
                            borderRadius: '20px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            height: '100%',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                系统信息
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {[
                                    { label: '后端框架', value: 'Go Fiber v3', color: '#00acd7' },
                                    { label: '数据库', value: 'MySQL 8.0', color: '#4479a1' },
                                    { label: '缓存', value: 'Redis', color: '#dc382d' },
                                    { label: '认证方式', value: 'JWT + Redis', color: '#f7df1e' },
                                ].map((item) => (
                                    <Box
                                        key={item.label}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            borderRadius: '12px',
                                            background: '#f8fafc',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            {item.label}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    background: item.color,
                                                }}
                                            />
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {item.value}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                        sx={{
                            borderRadius: '20px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            height: '100%',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                快捷操作
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {[
                                    { label: '用户管理', desc: '查看和管理系统用户', path: '/system/employee' },
                                    { label: '商品管理', desc: '管理商品信息和库存', path: '/product' },
                                ].map((item, idx) => (
                                    <Box
                                        key={item.label}
                                        role="button"
                                        tabIndex={0}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            borderRadius: '12px',
                                            background: '#f8fafc',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                background: '#e0e7ff',
                                                transform: 'translateX(4px)',
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
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {item.label}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {item.desc}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '8px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {idx + 1}
                                        </Box>
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
