// src/pages/Employee/EmployeeDialog.tsx
import { type JSX, useState, useEffect } from 'react'
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    Switch,
    FormControlLabel,
} from '@mui/material'
import type { IEmployee, CreateEmployeeForm } from '../../types/employee'
import type { IDepartment } from '../../types/department'
import type { IRole } from '../../types/role'
import { isValidUrl } from '../../utils/validators'
import { DIALOG_PAPER_SLOT_PROPS } from '../../utils/dialog'

interface EmployeeDialogProps {
    open: boolean
    editingEmployee: IEmployee | null
    formData: CreateEmployeeForm
    departments: IDepartment[]
    roles: IRole[]
    formError: string
    submitting: boolean
    onFormChange: (form: CreateEmployeeForm) => void
    onSubmit: () => void
    onClose: () => void
}

const fieldProps = {
    fullWidth: true,
    size: 'small' as const,
    sx: { '& .MuiOutlinedInput-root': { borderRadius: '12px' } },
}

const dialogContentSx = { px: 3, pt: '20px !important', pb: 2 }

export function EmployeeDialog({
    open,
    editingEmployee,
    formData,
    departments,
    roles,
    formError,
    submitting,
    onFormChange,
    onSubmit,
    onClose,
}: EmployeeDialogProps): JSX.Element {
    const isEditMode = Boolean(editingEmployee)

    const [touched, setTouched] = useState<Record<string, boolean>>({})

    useEffect(() => {
        if (open) setTouched({});
    }, [open]);

    const nameError = touched.realName && !formData.realName?.trim()
    const phoneError = touched.phone && (!formData.phone?.trim() || !/^1[3-9]\d{9}$/.test(formData.phone))
    const avatarError = touched.avatar && formData.avatar !== '' && formData.avatar !== undefined && !isValidUrl(formData.avatar)

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            disablePortal
            slotProps={DIALOG_PAPER_SLOT_PROPS}
        >
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.125rem', pb: 1 }}>
                {isEditMode ? '编辑员工' : '新建员工'}
            </DialogTitle>
            <DialogContent sx={dialogContentSx}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {formError && (
                        <Alert severity="error" sx={{ borderRadius: '12px' }}>
                            {formError}
                        </Alert>
                    )}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="姓名 *"
                            value={formData.realName}
                            onChange={(e) => onFormChange({ ...formData, realName: e.target.value })}
                            onBlur={() => setTouched((t) => ({ ...t, realName: true }))}
                            error={nameError}
                            helperText={nameError ? '姓名不能为空' : ''}
                            {...fieldProps}
                        />
                        <TextField
                            label="手机号 *"
                            value={formData.phone}
                            onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
                            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                            error={phoneError}
                            helperText={phoneError ? (formData.phone?.trim() ? '手机号格式不正确' : '手机号不能为空') : ''}
                            slotProps={{ htmlInput: { maxLength: 11 } }}
                            {...fieldProps}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="头像URL"
                            value={formData.avatar ?? ''}
                            onChange={(e) => onFormChange({ ...formData, avatar: e.target.value })}
                            onBlur={() => setTouched((t) => ({ ...t, avatar: true }))}
                            error={avatarError}
                            helperText={avatarError ? '请输入有效的URL地址' : ''}
                            placeholder="https://..."
                            {...fieldProps}
                        />
                        <TextField
                            label="邮箱"
                            value={formData.email}
                            onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                            {...fieldProps}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="部门 *"
                            select
                            value={formData.department ?? ''}
                            onChange={(e) => onFormChange({ ...formData, department: e.target.value })}
                            slotProps={{ select: { native: true } }}
                            {...fieldProps}
                        >
                            <option value=""></option>
                            {(departments || []).map((d) => (
                                <option key={d.deptId} value={String(d.deptId)}>{d.deptName}</option>
                            ))}
                        </TextField>
                        <TextField
                            label="职位 *"
                            select
                            value={formData.position ?? ''}
                            onChange={(e) => onFormChange({ ...formData, position: e.target.value })}
                            slotProps={{ select: { native: true } }}
                            {...fieldProps}
                        >
                            <option value=""></option>
                            <option value="经理">经理</option>
                            <option value="员工">员工</option>
                        </TextField>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="年龄"
                            type="number"
                            value={formData.age ?? ''}
                            onChange={(e) => onFormChange({ ...formData, age: e.target.value ? Number(e.target.value) : undefined })}
                            slotProps={{ htmlInput: { min: 0, max: 150 } }}
                            {...fieldProps}
                        />
                        <TextField
                            label="性别"
                            select
                            value={formData.gender ?? 1}
                            onChange={(e) => onFormChange({ ...formData, gender: Number(e.target.value) })}
                            slotProps={{ select: { native: true } }}
                            {...fieldProps}
                        >
                            <option value={1}>男</option>
                            <option value={2}>女</option>
                            <option value={3}>未知</option>
                        </TextField>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="角色"
                            select
                            value={formData.role ?? 'employee'}
                            onChange={(e) => onFormChange({ ...formData, role: e.target.value })}
                            slotProps={{ select: { native: true } }}
                            {...fieldProps}
                        >
                            {(roles || []).map((r) => (
                                <option key={r.id} value={r.roleKey}>{r.roleName}</option>
                            ))}
                        </TextField>
                        {isEditMode ? (
                            <TextField
                                label="在职状态"
                                select
                                value={formData.workStatus ?? 1}
                                onChange={(e) => onFormChange({ ...formData, workStatus: Number(e.target.value) })}
                                slotProps={{ select: { native: true } }}
                                {...fieldProps}
                            >
                                <option value={1}>在职</option>
                                <option value={0}>离职</option>
                            </TextField>
                        ) : (
                            <TextField
                                label="初始密码 *"
                                type="password"
                                value={formData.password ?? ''}
                                onChange={(e) => onFormChange({ ...formData, password: e.target.value })}
                                slotProps={{ htmlInput: { autoComplete: 'new-password', maxLength: 64 } }}
                                {...fieldProps}
                            />
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.canLogin === 1}
                                    onChange={(e) => onFormChange({ ...formData, canLogin: e.target.checked ? 1 : 0 })}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#667eea' },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#667eea' },
                                    }}
                                />
                            }
                            label="后台权限"
                        />
                    </Box>
                    <TextField
                        label="备注"
                        value={formData.remark ?? ''}
                        onChange={(e) => onFormChange({ ...formData, remark: e.target.value })}
                        multiline
                        rows={2}
                        {...fieldProps}
                    />
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
                    {submitting ? <CircularProgress size={20} color="inherit" /> : isEditMode ? '保存' : '创建'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
