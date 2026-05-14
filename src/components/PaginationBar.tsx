// src/components/PaginationBar.tsx
import { type JSX } from 'react'
import { Box, Typography, Pagination, TextField } from '@mui/material'

export interface PaginationBarProps {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
}

export default function PaginationBar({
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
}: PaginationBarProps): JSX.Element {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
                py: 2.5,
                borderTop: '1px solid #e2e8f0',
                flexShrink: 0,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                    每页
                </Typography>
                <TextField
                    size="small"
                    select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    slotProps={{ select: { native: true } }}
                    sx={{
                        width: 80,
                        '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                    }}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </TextField>
                <Typography variant="body2" color="text.secondary">
                    条，共 {total} 条
                </Typography>
            </Box>
            <Pagination
                count={Math.ceil(total / pageSize)}
                page={page}
                onChange={(_, v) => onPageChange(v)}
                shape="rounded"
                size="small"
                sx={{
                    '& .MuiPaginationItem-root': { borderRadius: '10px' },
                }}
            />
        </Box>
    )
}
