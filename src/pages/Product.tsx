// src/pages/Product.tsx
import { type JSX, useState } from 'react'
import {
    Box,
    Typography,
    Paper,
} from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'

export default function Product(): JSX.Element {
    const [list] = useState<never[]>([])

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

            {list.length === 0 ? (
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
            ) : null}
        </Box>
    )
}
