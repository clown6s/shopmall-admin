// src/pages/Permission/PermissionDialog.tsx
import { type JSX } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Box,
} from '@mui/material'
import type { CreatePermissionForm } from '../../types/permission'
import { DIALOG_PAPER_SLOT_PROPS } from '../../utils/dialog'

export interface PermissionDialogProps {
    open: boolean
    title: string
    formData: CreatePermissionForm
    formError: string
    submitting: boolean
    onFormChange: (form: CreatePermissionForm) => void
    onSubmit: () => void
    onClose: () => void
}

export function PermissionDialog({
    open,
    title,
    formData,
    formError,
    submitting,
    onFormChange,
    onSubmit,
    onClose,
}: PermissionDialogProps): JSX.Element {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            disablePortal
            slotProps={DIALOG_PAPER_SLOT_PROPS}
        >
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                {title}
            </DialogTitle>
            <DialogContent sx={{ px: 3, pt: '24px !important', pb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {formError && (
                        <Alert severity="error" sx={{ borderRadius: '12px' }}>
                            {formError}
                        </Alert>
                    )}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="权限名称 *"
                            value={formData.permissionName}
                            onChange={(e) => onFormChange({ ...formData, permissionName: e.target.value })}
                            slotProps={{ htmlInput: { maxLength: 50 } }}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            label="权限标识 *"
                            value={formData.permissionKey}
                            onChange={(e) => onFormChange({ ...formData, permissionKey: e.target.value })}
                            placeholder="如 system:employee:list"
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="类型 *"
                            select
                            value={formData.type}
                            onChange={(e) => onFormChange({ ...formData, type: Number(e.target.value) })}
                            fullWidth
                            slotProps={{ select: { native: true } }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        >
                            <option value={1}>菜单</option>
                            <option value={2}>按钮</option>
                            <option value={3}>API</option>
                        </TextField>
                        <TextField
                            label="HTTP 方法"
                            select
                            value={formData.method}
                            onChange={(e) => onFormChange({ ...formData, method: e.target.value })}
                            fullWidth
                            slotProps={{ select: { native: true } }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        >
                            <option value="">不限</option>
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                        </TextField>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="父权限ID"
                            type="number"
                            value={formData.parentId}
                            onChange={(e) => onFormChange({ ...formData, parentId: Number(e.target.value) || 0 })}
                            helperText="0 表示顶级权限"
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            label="排序"
                            type="number"
                            value={formData.sortOrder}
                            onChange={(e) => onFormChange({ ...formData, sortOrder: Number(e.target.value) || 0 })}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Box>
                    <TextField
                        label="路由路径"
                        value={formData.path}
                        onChange={(e) => onFormChange({ ...formData, path: e.target.value })}
                        placeholder="如 /system/employee"
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField
                        label="状态"
                        select
                        value={formData.status}
                        onChange={(e) => onFormChange({ ...formData, status: Number(e.target.value) })}
                        fullWidth
                        slotProps={{ select: { native: true } }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    >
                        <option value={1}>启用</option>
                        <option value={0}>禁用</option>
                    </TextField>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} sx={{ borderRadius: '10px', px: 3, color: '#64748b' }}>
                    取消
                </Button>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={submitting}
                    sx={{
                        borderRadius: '10px',
                        px: 4,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    }}
                >
                    {submitting ? <CircularProgress size={20} color="inherit" /> : (title === '新建权限' ? '创建' : '保存')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
