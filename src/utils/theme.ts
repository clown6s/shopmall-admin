import type { SxProps, Theme } from '@mui/material'

/** 主按钮渐变背景 */
export const PRIMARY_BUTTON_SX: SxProps<Theme> = {
    borderRadius: '12px',
    px: 3,
    py: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    '&:hover': {
        background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
    },
} as const

/** 取消按钮样式 */
export const CANCEL_BUTTON_SX: SxProps<Theme> = {
    borderRadius: '10px',
    px: 3,
    color: '#64748b',
    textTransform: 'none' as const,
} as const

/** 表头单元格样式 */
export const TABLE_HEADER_CELL_SX: SxProps<Theme> = {
    fontWeight: 600,
    color: '#64748b',
    py: 1.5,
} as const
