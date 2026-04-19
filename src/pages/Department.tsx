// src/pages/Department.tsx
import { type JSX, useEffect, useState, useCallback } from 'react'
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    Chip,
    Pagination,
    InputAdornment,
    Tooltip,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import GroupsIcon from '@mui/icons-material/Groups'
import type { IDepartment, CreateDepartmentForm } from '../types/department'
import { getDepartmentsApi, createDepartmentApi, updateDepartmentApi, deleteDepartmentApi } from '../api/department'
import { useIsAdmin } from '../hooks/useIsAdmin'

const DEFAULT_FORM: CreateDepartmentForm = {
    deptName: '',
    deptSort: 0,
    status: 1,
    remark: '',
}

export default function Department(): JSX.Element {
    const [list, setList] = useState<IDepartment[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [openCreate, setOpenCreate] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [currentDepartment, setCurrentDepartment] = useState<IDepartment | null>(null)
    const [form, setForm] = useState<CreateDepartmentForm>({ ...DEFAULT_FORM })
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<IDepartment | null>(null)
    const [deleting, setDeleting] = useState(false)
    const isAdmin = useIsAdmin()

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const res = await getDepartmentsApi({ page, pageSize, deptName: search || undefined })
            setList(res.data.data.list)
            setTotal(res.data.data.total)
        } catch {
            setError('获取部门列表失败')
        } finally {
            setLoading(false)
        }
    }, [page, pageSize, search])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleSearch = () => {
        setSearch(searchInput)
        setPage(1)
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
            setOpenCreate(false)
            setForm({ ...DEFAULT_FORM })
            fetchData()
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
            setOpenEdit(false)
            setCurrentDepartment(null)
            fetchData()
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
            await deleteDepartmentApi(deleteTarget.deptId)
            setDeleteTarget(null)
            fetchData()
        } catch {
            setDeleteTarget(null)
        } finally {
            setDeleting(false)
        }
    }

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
        setOpenEdit(true)
    }

    const handleOpenCreate = () => {
        setForm({ ...DEFAULT_FORM })
        setFormError('')
        setOpenCreate(true)
    }

    const getErrorMsg = (err: unknown, fallback: string) => {
        return (
            (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? fallback
        )
    }

    const formFields = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {formError && (
                <Alert severity="error" sx={{ borderRadius: '12px' }}>
                    {formError}
                </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="部门名称 *"
                    value={form.deptName}
                    onChange={(e) => setForm({ ...form, deptName: e.target.value })}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                <TextField
                    label="排序"
                    type="number"
                    value={form.deptSort}
                    onChange={(e) => setForm({ ...form, deptSort: Number(e.target.value) || 0 })}
                    slotProps={{ htmlInput: { min: 0 } }}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    label="状态"
                    select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
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
                value={form.remark ?? ''}
                onChange={(e) => setForm({ ...form, remark: e.target.value })}
                multiline
                rows={2}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
        </Box>
    )

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
                {isAdmin && (
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
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                background: '#f8fafc',
                            },
                        }}
                    />
                    <Button
                        variant="outlined"
                        onClick={handleSearch}
                        sx={{
                            borderRadius: '12px',
                            px: 3,
                            borderColor: '#e2e8f0',
                            color: '#64748b',
                            '&:hover': {
                                borderColor: '#667eea',
                                color: '#667eea',
                                background: 'rgba(102, 126, 234, 0.05)',
                            },
                        }}
                    >
                        搜索
                    </Button>
                </Box>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                </Alert>
            )}

            {/* Table */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                }}
            >
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ background: '#f8fafc' }}>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b', pl: 3, py: 1.5 }}>部门名称</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>排序</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>状态</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>创建时间</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>备注</TableCell>
                                {isAdmin && (
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5, pr: 3 }}>
                                    操作
                                </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} sx={{ color: '#667eea' }} />
                                    </TableCell>
                                </TableRow>
                            ) : list.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <GroupsIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                                            <Typography>暂无部门数据</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                list.map((dept) => (
                                    <TableRow
                                        key={dept.deptId}
                                        hover
                                        sx={{
                                            '&:hover': { background: '#f8fafc' },
                                            transition: 'background 0.2s ease',
                                        }}
                                    >
                                        <TableCell sx={{ pl: 3, py: 1.5 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {dept.deptName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center" sx={{ py: 1.5 }}>
                                            <Typography variant="body2">{dept.deptSort}</Typography>
                                        </TableCell>
                                        <TableCell align="center" sx={{ py: 1.5 }}>
                                            <Chip
                                                label={dept.status === 1 ? '启用' : '禁用'}
                                                color={dept.status === 1 ? 'success' : 'default'}
                                                size="small"
                                                sx={{ height: 24, fontWeight: 500, '& .MuiChip-label': { px: 1 } }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Typography variant="body2">
                                                {dept.createTime ? dept.createTime.split(' ')[0] : '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {dept.remark || '—'}
                                            </Typography>
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell align="center" sx={{ py: 1.5, pr: 3 }}>
                                                <Tooltip title="编辑">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenEdit(dept)}
                                                        sx={{
                                                            color: '#64748b',
                                                            '&:hover': {
                                                                background: 'rgba(100, 116, 139, 0.1)',
                                                            },
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="删除">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setDeleteTarget(dept)}
                                                        sx={{
                                                            color: '#ef4444',
                                                            '&:hover': {
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                            },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {total > pageSize && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            p: 2,
                            borderTop: '1px solid #e2e8f0',
                        }}
                    >
                        <Pagination
                            count={Math.ceil(total / pageSize)}
                            page={page}
                            onChange={(_, v) => setPage(v)}
                            color="primary"
                            shape="rounded"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    borderRadius: '10px',
                                },
                            }}
                        />
                    </Box>
                )}
            </Paper>

            {/* Create Dialog */}
            <Dialog
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                maxWidth="sm"
                fullWidth
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
                    新建部门
                </DialogTitle>
                <DialogContent sx={{ px: 3, pt: '24px !important', pb: 2 }}>{formFields}</DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setOpenCreate(false)}
                        sx={{ borderRadius: '10px', px: 3, color: '#64748b' }}
                    >
                        取消
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreate}
                        disabled={submitting}
                        sx={{
                            borderRadius: '10px',
                            px: 4,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : '创建'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={openEdit}
                onClose={() => setOpenEdit(false)}
                maxWidth="sm"
                fullWidth
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
                    编辑部门
                </DialogTitle>
                <DialogContent sx={{ px: 3, pt: '24px !important', pb: 2 }}>{formFields}</DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setOpenEdit(false)}
                        sx={{ borderRadius: '10px', px: 3, color: '#64748b' }}
                    >
                        取消
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleEdit}
                        disabled={submitting}
                        sx={{
                            borderRadius: '10px',
                            px: 4,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : '保存'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
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
                        确定要删除部门 <strong>{deleteTarget?.deptName}</strong> 吗？
                        <br />
                        此操作不可撤销。
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteTarget(null)} sx={{ borderRadius: '10px' }}>
                        取消
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                        disabled={deleting}
                        sx={{ borderRadius: '10px' }}
                    >
                        {deleting ? <CircularProgress size={18} color="inherit" /> : '删除'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
