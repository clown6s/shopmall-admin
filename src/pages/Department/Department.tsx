// src/pages/Department/Department.tsx
import { type JSX, useState, useCallback } from 'react'
import {
    Box,
    Typography,
    Button,
    Paper,
    Alert,
    InputAdornment,
    IconButton,
    TextField,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import type { IDepartment, CreateDepartmentForm } from '../../types/department'
import { createDepartmentApi, updateDepartmentApi, deleteDepartmentApi } from '../../api/department'
import useUserStore from '../../store/useUserStore'
import { useDepartmentData } from './useDepartmentData'
import { DepartmentTable } from './DepartmentTable'
import { DepartmentDialog } from './DepartmentDialog'
import { DepartmentDeleteDialog } from './DepartmentDeleteDialog'

const DEFAULT_FORM: CreateDepartmentForm = {
    deptName: '',
    deptSort: 0,
    status: 1,
    remark: '',
}

export default function Department(): JSX.Element {
    const { list, total, page, pageSize, search, loading, error, setPage, setPageSize, setSearch, fetchData } = useDepartmentData()
    const hasPermission = useUserStore((s) => s.hasPermission)

    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
    const [currentDepartment, setCurrentDepartment] = useState<IDepartment | null>(null)
    const [form, setForm] = useState<CreateDepartmentForm>({ ...DEFAULT_FORM })
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<IDepartment | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState('')

    const getErrorMsg = useCallback((err: unknown, fallback: string) => {
        return (
            (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? fallback
        )
    }, [])

    const initForm = (dept: IDepartment) => {
        setForm({
            deptName: dept.deptName,
            deptSort: dept.deptSort,
            status: dept.status,
            remark: dept.remark,
        })
    }

    const handleOpenEdit = (dept: IDepartment) => {
        setCurrentDepartment(dept)
        initForm(dept)
        setFormError('')
        setDialogMode('edit')
    }

    const handleOpenCreate = () => {
        setForm({ ...DEFAULT_FORM })
        setFormError('')
        setDialogMode('create')
    }

    const handleCreate = async () => {
        setFormError('')
        if (!form.deptName) {
            setFormError('部门名称为必填项')
            return
        }
        try {
            setSubmitting(true)
            await createDepartmentApi(form)
            setDialogMode(null)
            setForm({ ...DEFAULT_FORM })
            await fetchData()
        } catch (err: unknown) {
            setFormError(getErrorMsg(err, '创建失败'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = async () => {
        if (!currentDepartment) return
        setFormError('')
        if (!form.deptName) {
            setFormError('部门名称为必填项')
            return
        }
        try {
            setSubmitting(true)
            await updateDepartmentApi(currentDepartment.deptId, form)
            setDialogMode(null)
            setCurrentDepartment(null)
            await fetchData()
        } catch (err: unknown) {
            setFormError(getErrorMsg(err, '更新失败'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            setDeleteError('')
            await deleteDepartmentApi(deleteTarget.deptId)
            setDeleteTarget(null)
            fetchData()
        } catch {
            setDeleteError('删除失败，请重试')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <Box sx={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        部门管理
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        管理系统部门信息
                    </Typography>
                </Box>
                {hasPermission('system:department:create') && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreate}
                        sx={{
                            borderRadius: '12px',
                            px: 3,
                            py: 1,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                            },
                        }}
                    >
                        新建部门
                    </Button>
                )}
            </Box>

            {/* Search Bar */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                }}
            >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="按部门名称搜索..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: search ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearch('')}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null,
                            },
                        }}
                        sx={{
                            flex: 1,
                            maxWidth: 320,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                background: '#f8fafc',
                            },
                        }}
                    />
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

            <DepartmentTable
                list={list}
                loading={loading}
                page={page}
                pageSize={pageSize}
                total={total}
                canEdit={hasPermission('system:department:update')} canDelete={hasPermission('system:department:delete')}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onEdit={handleOpenEdit}
                onDelete={setDeleteTarget}
            />

            <DepartmentDialog
                open={dialogMode !== null}
                title={dialogMode === 'edit' ? '编辑部门' : '新建部门'}
                formData={form}
                formError={formError}
                submitting={submitting}
                onFormChange={setForm}
                onSubmit={dialogMode === 'edit' ? handleEdit : handleCreate}
                onClose={() => setDialogMode(null)}
            />

            <DepartmentDeleteDialog
                open={Boolean(deleteTarget)}
                target={deleteTarget}
                deleting={deleting}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </Box>
    )
}
