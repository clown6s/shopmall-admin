// src/pages/Employee/Employee.tsx
import { type JSX, useEffect, useState, useCallback } from 'react'
import {
    Box,
    Typography,
    Button,
    IconButton,
    Tooltip,
    Paper,
    TextField,
    InputAdornment,
    Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import type { IEmployee, CreateEmployeeForm } from '../../types/employee'
import useUserStore from '../../store/useUserStore'
import { createEmployeeApi, updateEmployeeApi, deleteEmployeeApi, resetPasswordApi } from '../../api/employee'
import { getAllDepartmentsApi } from '../../api/department'
import { getRolesApi } from '../../api/role'
import { PASSWORD_HINT, isValidPassword, isValidPhone, isValidEmail, isValidUrl } from '../../utils/validators'
import { getApiErrorMsg } from '../../utils/errorHelper'
import type { IDepartment } from '../../types/department'
import type { IRole } from '../../types/role'
import { useEmployeeData } from './useEmployeeData'
import { PRIMARY_BUTTON_SX } from '../../utils/theme'
import { EmployeeTable } from './EmployeeTable'
import { EmployeeDialog } from './EmployeeDialog'
import { EmployeeDeleteDialog } from './EmployeeDeleteDialog'

const DEFAULT_FORM: CreateEmployeeForm = {
    realName: '', phone: '', email: '', age: undefined, gender: 1,
    department: '', position: '', role: 'employee', workStatus: 1, canLogin: 1, remark: '',
}

const iconButtonSx = {
    border: '1px solid #e2e8f0', borderRadius: '10px', color: '#64748b',
    '&:hover': { borderColor: '#667eea', color: '#667eea' },
}

const paperSx = { p: 2, mb: 3, borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff' }

export default function Employee(): JSX.Element {
    const {
        list,
        total,
        page,
        pageSize,
        loading,
        error,
        filters,
        setPage,
        setFilters,
        fetchData,
        handlePageSizeChange,
        handleReset: resetFilters,
    } = useEmployeeData()

    const [openCreate, setOpenCreate] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [currentEmployee, setCurrentEmployee] = useState<IEmployee | null>(null)
    const [form, setForm] = useState<CreateEmployeeForm>({ ...DEFAULT_FORM })
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<IEmployee | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [departments, setDepartments] = useState<IDepartment[]>([])
    const [roles, setRoles] = useState<IRole[]>([])
    const hasPermission = useUserStore((s) => s.hasPermission)

    // M-1: 已移除重复的 useEffect — useEmployeeData hook 内部已有自动 fetchData

    const [deleteError, setDeleteError] = useState('')

    const handleReset = () => {
        resetFilters()
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            setDeleteError('')
            await deleteEmployeeApi(deleteTarget.id)
            setDeleteTarget(null)
            await fetchData()
        } catch (err: unknown) {
            setDeleteError(getApiErrorMsg(err, '删除失败，请重试'))
        } finally {
            setDeleting(false)
        }
    }

    const fetchDepartments = useCallback(async () => {
        try {
            const [deptRes, roleRes] = await Promise.all([
                getAllDepartmentsApi(),
                getRolesApi(),
            ])
            const data = deptRes.data as IDepartment[]
            setDepartments(Array.isArray(data) ? data : [])
            const roleData = roleRes.data as IRole[]
            setRoles(Array.isArray(roleData) ? roleData : [])
        } catch {
            setDepartments([])
            setRoles([])
        }
    }, [])

    useEffect(() => {
        fetchDepartments()
    }, [fetchDepartments])

    const handleOpenDialog = async (emp?: IEmployee) => {
        await fetchDepartments()
        if (emp) {
            setCurrentEmployee(emp)
            setForm({
                realName: emp.realName,
                phone: emp.phone,
                email: emp.email,
                age: emp.age,
                gender: emp.gender,
                department: emp.department,
                position: emp.position,
                role: emp.role || 'employee',
                workStatus: emp.workStatus,
                canLogin: emp.canLogin,
                remark: emp.remark,
                avatar: emp.avatar || '',
            })
            setOpenEdit(true)
        } else {
            setForm({ ...DEFAULT_FORM })
            setOpenCreate(true)
        }
        setFormError('')
    }

    const isEditMode = Boolean(currentEmployee)

    const validateForm = (): boolean => {
        setFormError('')
        if (!form.realName?.trim()) { setFormError('姓名不能为空'); return false }
        if (!form.phone?.trim()) { setFormError('手机号不能为空'); return false }
        if (!isValidPhone(form.phone)) { setFormError('手机号格式不正确'); return false }
        if (!form.department?.trim()) { setFormError('部门不能为空'); return false }
        if (!form.position?.trim()) { setFormError('职位不能为空'); return false }
        if (!isEditMode && (!form.password || !isValidPassword(form.password))) { setFormError(PASSWORD_HINT); return false }
        if (form.email && !isValidEmail(form.email)) { setFormError('邮箱格式不正确'); return false }
        if (form.avatar && !isValidUrl(form.avatar)) { setFormError('头像URL格式不正确'); return false }
        if (form.age !== undefined && (form.age < 0 || form.age > 150)) { setFormError('年龄需在0-150之间'); return false }
        return true
    }

    const handleCreate = async () => {
        if (!validateForm()) return
        try {
            setSubmitting(true)
            await createEmployeeApi(form)
            setOpenCreate(false)
            setForm({ ...DEFAULT_FORM })
            await fetchData()
        } catch (err: unknown) {
            setFormError(getApiErrorMsg(err, '创建失败'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = async () => {
        if (!currentEmployee || !validateForm()) return
        try {
            setSubmitting(true)
            await updateEmployeeApi(currentEmployee.id, form)
            setOpenEdit(false)
            setCurrentEmployee(null)
            await fetchData()
        } catch (err: unknown) {
            setFormError(getApiErrorMsg(err, '更新失败'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleResetPassword = async (empId: number, newPassword: string) => {
        await resetPasswordApi(empId, newPassword)
    }

    const handleDialogClose = () => {
        setOpenCreate(false)
        setOpenEdit(false)
        setCurrentEmployee(null)
        setForm({ ...DEFAULT_FORM })
        setFormError('')
    }

    return (
        <Box sx={{ animation: 'fadeIn 0.3s ease-out' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        员工管理
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        管理系统员工信息和在职状态
                    </Typography>
                </Box>
                {hasPermission('system:employee:create') && (
                    <Button variant="contained" startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()} sx={PRIMARY_BUTTON_SX}>
                        新建员工
                    </Button>
                )}
            </Box>

            <Paper elevation={0} sx={paperSx}>
                <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="按姓名搜索"
                        value={filters.realName}
                        onChange={(e) => setFilters({ ...filters, realName: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px', background: '#f8fafc' } }}
                    />
                    <TextField
                        size="small"
                        placeholder="按手机号搜索"
                        value={filters.phone}
                        onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                        slotProps={{ htmlInput: { maxLength: 11 } }}
                        sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px', background: '#f8fafc' } }}
                    />
                    <Tooltip title="重置筛选">
                        <IconButton size="small" onClick={handleReset} sx={iconButtonSx}>
                            <RestartAltIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                </Alert>
            )}

            {deleteError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setDeleteError('')}>
                    {deleteError}
                </Alert>
            )}

            <EmployeeTable
                list={list}
                loading={loading}
                page={page}
                pageSize={pageSize}
                total={total}
                canEdit={hasPermission('system:employee:update')} canDelete={hasPermission('system:employee:delete')}
                departments={departments}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
                onEdit={(emp) => handleOpenDialog(emp)}
                onDelete={(emp) => setDeleteTarget(emp)}
            />

            <EmployeeDialog
                open={openCreate || openEdit}
                editingEmployee={currentEmployee}
                formData={form}
                departments={departments}
                roles={roles}
                formError={formError}
                submitting={submitting}
                onFormChange={setForm}
                onSubmit={isEditMode ? handleEdit : handleCreate}
                onResetPassword={handleResetPassword}
                onClose={handleDialogClose}
            />

            <EmployeeDeleteDialog
                open={Boolean(deleteTarget)}
                target={deleteTarget}
                deleting={deleting}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </Box>
    )
}
