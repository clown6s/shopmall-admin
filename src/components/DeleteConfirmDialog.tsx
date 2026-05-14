import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
} from '@mui/material'

export interface DeleteConfirmDialogProps {
    open: boolean
    title?: string
    /** 显示在提示文案中的实体名称 */
    entityName: string
    /** 实体类型文案，如 "策略"、"部门"、"员工" 等 */
    entityType: string
    deleting: boolean
    onConfirm: () => void
    onClose: () => void
}

export default function DeleteConfirmDialog({
    open,
    title = '确认删除',
    entityName,
    entityType,
    deleting,
    onConfirm,
    onClose,
}: DeleteConfirmDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{ paper: { sx: { borderRadius: '20px' } } }}
        >
            <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
            <DialogContent>
                <Typography color="text.secondary">
                    确定要删除{entityType} <strong>{entityName}</strong> 吗？
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
