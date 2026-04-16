// src/pages/Product.tsx
import { type JSX, useEffect, useState } from 'react'
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    CircularProgress,
    Paper,
} from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import request from '../api/request'
import type { ApiResponse } from '../types/api'
import type { IProduct } from '../types/product'

export default function Product(): JSX.Element {
    const [list, setList] = useState<IProduct[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await request.get<ApiResponse<IProduct[]>>('/products')
                setList(res.data.data)
            } catch (error) {
                console.error('获取商品失败:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <Box sx={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    商品管理
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    管理系统商品信息和库存
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={40} sx={{ color: '#667eea' }} />
                </Box>
            ) : list.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0',
                        p: 8,
                        textAlign: 'center',
                    }}
                >
                    <StorefrontIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        暂无商品
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        商品数据将在后端接口完善后显示
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {list.map((item) => (
                        <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Card
                                sx={{
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '14px',
                                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <StorefrontIcon sx={{ fontSize: 24, color: '#fff' }} />
                                        </Box>
                                        <Chip
                                            label="在售"
                                            size="small"
                                            sx={{
                                                height: 24,
                                                fontWeight: 500,
                                                background: '#ecfdf5',
                                                color: '#059669',
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                        {item.name}
                                    </Typography>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 700,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        ¥{item.price}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    )
}
