// src/pages/Employee.tsx
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
    Avatar,
    Tooltip,
    Switch,
    FormControlLabel,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import MaleIcon from '@mui/icons-material/Male'
import FemaleIcon from '@mui/icons-material/Female'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import BadgeIcon from '@mui/icons-material/Badge'
import type { IEmployee, CreateEmployeeForm } from '../types/employee'
import { getEmployeesApi, createEmployeeApi, updateEmployeeApi, deleteEmployeeApi } from '../api/employee'

const GENDER_MAP: Record<number, { label: string; color: 'primary' | 'secondary' | 'default'; icon: JSX.Element }> = {
    1: { label: '男', color: 'primary', icon: <MaleIcon fontSize="small" /> },
    2: { label: '女', color: 'secondary', icon: <FemaleIcon fontSize="small" /> },
    3: { label: '未知', color: 'default', icon: <QuestionMarkIcon fontSize="small" /> },
}

const DEFAULT_FORM: CreateEmployeeForm = {
    name: '',
    phone: '',
    email: '',
    age: undefined,
    gender: 1,
    position: '',
    department: '',
    status: 1,
    remark: '',
}

export default function Employee(): JSX.Element {
    const [list, setList] = useState<IEmployee[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [openCreate, setOpenCreate] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [currentEmployee, setCurrentEmployee] = useState<IEmployee | null>(null)
    const [form, setForm] = useState<CreateEmployeeForm>({ ...DEFAULT_FORM })
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<IEmployee | null>(null)
    const [deleting, setDeleting] = useState(false)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const res = await getEmployeesApi({ page, pageSize, name: search || undefined })
            const d = res.data.data
            setList(d.list)
            setTotal(d.total)
        } catch {
            setError('获取员工列表失败')
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
        if (!form.name || !form.phone) {
            setFormError('姓名和手机号为必填项')
            return
        }
        try {
            setSubmitting(true)
            await createEmployeeApi(form)
            setOpenCreate(false)
            setForm({ ...DEFAULT_FORM })
            fetchData()
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? '创建失败'
            setFormError(msg)
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = async () => {
        if (!currentEmployee) return
        setFormError('')
        if (!form.name || !form.phone) {
            setFormError('姓名和手机号为必填项')
            return
        }
        try {
            setSubmitting(true)
            await updateEmployeeApi(currentEmployee.id, form)
            setOpenEdit(false)
            setCurrentEmployee(null)
            fetchData()
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? '更新失败'
            setFormError(msg)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            await deleteEmployeeApi(deleteTarget.id)
            setDeleteTarget(null)
            fetchData()
        } catch {
            setDeleteTarget(null)
        } finally {
            setDeleting(false)
        }
    }

    const getInitials = (name: string) => {
        return name ? name.charAt(0).toUpperCase() : '?'
    }

    const formFields = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {formError && (
                <Alert severity="error" sx={{ borderRadius: '12px' }}>
                    {formError}
                </Alert>
            )}
            <TextField
                label="姓名 *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="手机号 *"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    slotProps={{ htmlInput: { maxLength: 11 } }}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                <TextField
                    label="邮箱"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="部门"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                <TextField
                    label="职位"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="年龄"
                    type="number"
                    value={form.age ?? ''}
                    onChange={(e) =>
                        setForm({ ...form, age: e.target.value ? Number(e.target.value) : undefined })
                    }
                    slotProps={{ htmlInput: { min: 0, max: 150 } }}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                <TextField
                    label="性别"
                    select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: Number(e.target.value) })}
                    fullWidth
                    slotProps={{
                        select: { native: true },
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                >
                    <option value={1}>男</option>
                    <option value={2}>女</option>
                    <option value={3}>未知</option>
                </TextField>
            </Box>
            <FormControlLabel
                control={
                    <Switch
                        checked={form.status === 1}
                        onChange={(e) => setForm({ ...form, status: e.target.checked ? 1 : 0 })}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#667eea' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#667eea',
                            },
                        }}
                    />
                }
                label="在职"
            />
            <TextField
                label="备注"
                value={form.remark}
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
                        员工管理
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        管理系统员工信息和在职状态
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setForm({ ...DEFAULT_FORM })
                        setFormError('')
                        setOpenCreate(true)
                    }}
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
                    新建员工
                </Button>
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
                        placeholder="按姓名搜索员工..."
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
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        borderRadius: '12px',
                    }}
                >
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
                                <TableCell sx={{ fontWeight: 600, color: '#64748b', pl: 3 }}>员工信息</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>部门 / 职位</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>联系方式</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>性别</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>年龄</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>状态</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>入职时间</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', pr: 3 }}>
                                    操作
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} sx={{ color: '#667eea' }} />
                                    </TableCell>
                                </TableRow>
                            ) : list.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        align="center"
                                        sx={{ py: 8, color: 'text.secondary' }}
                                    >
                                        <Box sx={{ textAlign: 'center' }}>
                                            <BadgeIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                                            <Typography>暂无员工数据</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                list.map((emp) => {
                                    const g = GENDER_MAP[emp.gender] ?? GENDER_MAP[3]
                                    return (
                                        <TableRow
                                            key={emp.id}
                                            hover
                                            sx={{
                                                '&:hover': { background: '#f8fafc' },
                                                transition: 'background 0.2s ease',
                                            }}
                                        >
                                            <TableCell sx={{ pl: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {getInitials(emp.name)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {emp.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ID: {emp.id}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{emp.department || '—'}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {emp.position || '未分配'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{emp.phone}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {emp.email || '未设置邮箱'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={g.icon}
                                                    label={g.label}
                                                    color={g.color}
                                                    size="small"
                                                    sx={{
                                                        height: 28,
                                                        '& .MuiChip-icon': { fontSize: 16 },
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {emp.age ? `${emp.age} 岁` : '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={emp.status === 1 ? '在职' : '离职'}
                                                    color={emp.status === 1 ? 'success' : 'default'}
                                                    size="small"
                                                    sx={{
                                                        height: 28,
                                                        fontWeight: 500,
                                                        '& .MuiChip-label': { px: 1.5 },
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {emp.createdAt
                                                        ? new Date(emp.createdAt).toLocaleDateString('zh-CN')
                                                        : '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                <Tooltip title="编辑">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setCurrentEmployee(emp)
                                                            setForm({
                                                                name: emp.name,
                                                                phone: emp.phone,
                                                                email: emp.email,
                                                                age: emp.age,
                                                                gender: emp.gender,
                                                                department: emp.department,
                                                                position: emp.position,
                                                                status: emp.status,
                                                                remark: emp.remark,
                                                            })
                                                            setFormError('')
                                                            setOpenEdit(true)
                                                        }}
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
                                                        onClick={() => setDeleteTarget(emp)}
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
                                        </TableRow>
                                    )
                                })
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
                <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        新建员工
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ px: 3, py: 2 }}>{formFields}</DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setOpenCreate(false)}
                        sx={{
                            borderRadius: '10px',
                            px: 3,
                            color: '#64748b',
                        }}
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
                <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        编辑员工
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ px: 3, py: 2 }}>{formFields}</DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setOpenEdit(false)}
                        sx={{
                            borderRadius: '10px',
                            px: 3,
                            color: '#64748b',
                        }}
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
                        sx: {
                            borderRadius: '20px',
                        },
                    },
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        确认删除
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">
                        确定要删除员工 <strong>{deleteTarget?.name}</strong>（ID: {deleteTarget?.id}）吗？
                        <br />
                        此操作不可撤销。
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setDeleteTarget(null)}
                        sx={{ borderRadius: '10px' }}
                    >
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
