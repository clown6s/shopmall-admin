// src/pages/ABAC/ABACPolicyDialog.tsx
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
import type { CreateABACPolicyForm } from '../../types/abac'

export interface ABACPolicyDialogProps {
    open: boolean
    title: string
    formData: CreateABACPolicyForm
    formError: string
    submitting: boolean
    onFormChange: (form: CreateABACPolicyForm) => void
    onSubmit: () => void
    onClose: () => void
}

export function ABACPolicyDialog({
    open,
    title,
    formData,
    formError,
    submitting,
    onFormChange,
    onSubmit,
    onClose,
}: ABACPolicyDialogProps): JSX.Element {
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
                    {/* 第一行：名称 + 优先级 */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="策略名称 *"
                            value={formData.name}
                            onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                            slotProps={{ htmlInput: { maxLength: 50 } }}
                            helperText={`${(formData.name || '').length}/50`}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            label="优先级"
                            type="number"
                            value={formData.priority}
                            onChange={(e) => onFormChange({ ...formData, priority: Number(e.target.value) || 0 })}
                            helperText="数值越大优先级越高"
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Box>
                    {/* 第二行：效果 + HTTP方法 */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="效果 *"
                            select
                            value={formData.effect}
                            onChange={(e) => onFormChange({ ...formData, effect: e.target.value as 'allow' | 'deny' })}
                            fullWidth
                            slotProps={{ select: { native: true } }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        >
                            <option value="allow">允许 (allow)</option>
                            <option value="deny">拒绝 (deny)</option>
                        </TextField>
                        <TextField
                            label="HTTP 方法 *"
                            select
                            value={formData.action}
                            onChange={(e) => onFormChange({ ...formData, action: e.target.value })}
                            fullWidth
                            slotProps={{ select: { native: true } }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        >
                            <option value="*">* (所有方法)</option>
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                        </TextField>
                    </Box>
                    {/* 第三行：路径规则 */}
                    <TextField
                        label="路径规则"
                        value={formData.pathPattern}
                        onChange={(e) => onFormChange({ ...formData, pathPattern: e.target.value })}
                        placeholder="如 /api/employee/* 或 /api/department"
                        helperText="留空表示匹配所有路径，支持 /* 通配符"
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    {/* 第四行：部门限制 */}
                    <TextField
                        label="部门限制"
                        value={formData.departments}
                        onChange={(e) => onFormChange({ ...formData, departments: e.target.value })}
                        placeholder="如 admin,HR（逗号分隔）"
                        helperText="留空表示不限部门"
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    {/* 职位限制 */}
                    <TextField
                        label="职位限制"
                        value={formData.positions}
                        onChange={(e) => onFormChange({ ...formData, positions: e.target.value })}
                        placeholder="如 经理,总监（逗号分隔）"
                        helperText="留空表示不限职位"
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    {/* 用户ID限制 */}
                    <TextField
                        label="用户ID限制"
                        value={formData.userIds}
                        onChange={(e) => onFormChange({ ...formData, userIds: e.target.value })}
                        placeholder="如 1,3,5（逗号分隔的员工ID）"
                        helperText="留空表示不限制具体用户，精确到个人时使用"
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    {/* 第五行：状态 */}
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
                    {/* 第六行：描述 */}
                    <TextField
                        label="描述"
                        value={formData.description}
                        onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
                        multiline
                        rows={2}
                        placeholder="策略备注说明"
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
                    {submitting ? <CircularProgress size={20} color="inherit" /> : (title === '新建策略' ? '创建' : '保存')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
