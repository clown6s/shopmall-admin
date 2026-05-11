// src/pages/Department/DepartmentDeleteDialog.tsx
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
import type { IDepartment } from '../../types/department'

export interface DepartmentDeleteDialogProps {
    open: boolean
    target: IDepartment | null
    deleting: boolean
    onConfirm: () => void
    onClose: () => void
}

export function DepartmentDeleteDialog({
    open,
    target,
    deleting,
    onConfirm,
    onClose,
}: DepartmentDeleteDialogProps): JSX.Element {
    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                    确定要删除部门 <strong>{target?.deptName}</strong> 吗？
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
