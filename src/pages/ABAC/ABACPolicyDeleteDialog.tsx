// src/pages/ABAC/ABACPolicyDeleteDialog.tsx
import { type JSX } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
} from '@mui/material'
import type { ABACPolicy } from '../../types/abac'

export interface ABACPolicyDeleteDialogProps {
    open: boolean
    target: ABACPolicy | null
    deleting: boolean
    onConfirm: () => void
    onClose: () => void
}

export function ABACPolicyDeleteDialog({
    open,
    target,
    deleting,
    onConfirm,
    onClose,
}: ABACPolicyDeleteDialogProps): JSX.Element {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            {...{ disablePortal: true } as any}
            slotProps={{
                paper: {
                    sx: { borderRadius: '20px' },
                },
            }}
        >
            <DialogTitle sx={{ fontWeight: 700 }}>
                确认删除
            </DialogTitle>
            <DialogContent>
                <Typography color="text.secondary">
                    确定要删除策略 <strong>{target?.name}</strong> 吗？
                    <br />
                    此操作不可撤销。
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} sx={{ borderRadius: '10px' }}>
                    取消
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={onConfirm}
                    disabled={deleting}
                    sx={{ borderRadius: '10px' }}
                >
                    {deleting ? <CircularProgress size={18} color="inherit" /> : '删除'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
