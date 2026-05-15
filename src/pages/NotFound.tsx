import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
    const navigate = useNavigate()
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2 }}>
            <Typography variant="h1" sx={{ fontSize: 120, fontWeight: 700, color: 'primary.main' }}>404</Typography>
            <Typography variant="h6" color="text.secondary">页面不存在</Typography>
            <Button variant="contained" onClick={() => navigate('/')}>返回首页</Button>
        </Box>
    )
}
