// src/pages/Department/DepartmentDialog.tsx
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
import type { CreateDepartmentForm } from '../../types/department'

export interface DepartmentDialogProps {
    open: boolean
    title: string
    formData: CreateDepartmentForm
    formError: string
    submitting: boolean
    onFormChange: (form: CreateDepartmentForm) => void
    onSubmit: () => void
    onClose: () => void
}

export function DepartmentDialog({
    open,
    title,
    formData,
    formError,
    submitting,
    onFormChange,
    onSubmit,
    onClose,
}: DepartmentDialogProps): JSX.Element {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            {...{ disablePortal: true } as any}
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    },
                },
            }}
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
                            label="部门名称 *"
                            value={formData.deptName}
                            onChange={(e) => onFormChange({ ...formData, deptName: e.target.value })}
                            slotProps={{ htmlInput: { maxLength: 50 } }}
                            helperText={`${(formData.deptName || '').length}/50`}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            label="排序"
                            type="number"
                            value={formData.deptSort}
                            onChange={(e) => onFormChange({ ...formData, deptSort: Number(e.target.value) || 0 })}
                            slotProps={{ htmlInput: { min: 0 } }}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                    <TextField
                        label="备注"
                        value={formData.remark ?? ''}
                        onChange={(e) => onFormChange({ ...formData, remark: e.target.value })}
                        multiline
                        rows={2}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={onClose}
                    sx={{ borderRadius: '10px', px: 3, color: '#64748b' }}
                >
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
                    {submitting ? <CircularProgress size={20} color="inherit" /> : (title === '新建部门' ? '创建' : '保存')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
