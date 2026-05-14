// src/pages/Role/RoleDialog.tsx
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
import type { CreateRoleForm } from '../../types/role'
import { DIALOG_PAPER_SLOT_PROPS } from '../../utils/dialog'

export interface RoleDialogProps {
    open: boolean
    title: string
    formData: CreateRoleForm
    formError: string
    submitting: boolean
    onFormChange: (form: CreateRoleForm) => void
    onSubmit: () => void
    onClose: () => void
}

export function RoleDialog({
    open, title, formData, formError, submitting, onFormChange, onSubmit, onClose,
}: RoleDialogProps): JSX.Element {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            disablePortal
            slotProps={DIALOG_PAPER_SLOT_PROPS}
        >
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>{title}</DialogTitle>
            <DialogContent sx={{ px: 3, pt: '24px !important', pb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {formError && <Alert severity="error" sx={{ borderRadius: '12px' }}>{formError}</Alert>}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="角色名称 *"
                            value={formData.roleName}
                            onChange={(e) => onFormChange({ ...formData, roleName: e.target.value })}
                            slotProps={{ htmlInput: { maxLength: 50 } }}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            label="角色标识 *"
                            value={formData.roleKey}
                            onChange={(e) => onFormChange({ ...formData, roleKey: e.target.value })}
                            placeholder="如 admin, hr"
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Box>
                    <TextField
                        label="描述"
                        value={formData.description}
                        onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
                        multiline
                        rows={2}
                        placeholder="角色描述"
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
                <Button onClick={onClose} sx={{ borderRadius: '10px', px: 3, color: '#64748b' }}>取消</Button>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={submitting}
                    sx={{ borderRadius: '10px', px: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}
                >
                    {submitting ? <CircularProgress size={20} color="inherit" /> : (title === '新建角色' ? '创建' : '保存')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
