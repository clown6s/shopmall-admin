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
    realName: '',
    phone: '',
    email: '',
    age: undefined,
    gender: 1,
    department: '',
    position: '',
    role: '普通角色',
    workStatus: 1,
    loginStatus: 1,
    canLogin: 1,
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
            const res = await getEmployeesApi({ page, pageSize, realName: search || undefined })
            setList(res.data.data.list)
            setTotal(res.data.data.total)
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
        if (!form.realName || !form.phone) {
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
            setFormError(getErrorMsg(err, '创建失败'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = async () => {
        if (!currentEmployee) return
        setFormError('')
        if (!form.realName || !form.phone) {
            setFormError('姓名和手机号为必填项')
            return
        }
        try {
            setSubmitting(true)
            await updateEmployeeApi(currentEmployee.employeeId, form)
            setOpenEdit(false)
            setCurrentEmployee(null)
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
            await deleteEmployeeApi(deleteTarget.employeeId)
            setDeleteTarget(null)
            fetchData()
        } catch {
            setDeleteTarget(null)
        } finally {
            setDeleting(false)
        }
    }

    const getInitials = (name: string) => (name ? name.charAt(0).toUpperCase() : '?')

    const initForm = (emp: IEmployee) => {
        setForm({
            realName: emp.realName,
            phone: emp.phone,
            email: emp.email,
            age: emp.age,
            gender: emp.gender,
            department: emp.department,
            position: emp.position,
            role: emp.role || '普通角色',
            workStatus: emp.workStatus,
            loginStatus: emp.loginStatus,
            canLogin: emp.canLogin,
            remark: emp.remark,
        })
    }

    const handleOpenEdit = (emp: IEmployee) => {
        setCurrentEmployee(emp)
        initForm(emp)
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

    const isEditMode = Boolean(currentEmployee)

    const formFields = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {formError && (
                <Alert severity="error" sx={{ borderRadius: '12px' }}>
                    {formError}
                </Alert>
            )}
            {/* 基本信息 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="姓名 *"
                    value={form.realName}
                    onChange={(e) => setForm({ ...form, realName: e.target.value })}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                <TextField
                    label="手机号 *"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    slotProps={{ htmlInput: { maxLength: 11 } }}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
            </Box>
            {/* 联系方式 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="邮箱"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                <TextField
                    label="部门"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
            </Box>
            {/* 职位信息 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="职位"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
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
            </Box>
            {/* 性别 / 角色 / 状态 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="性别"
                    select
                    value={form.gender ?? 1}
                    onChange={(e) => setForm({ ...form, gender: Number(e.target.value) })}
                    fullWidth
                    slotProps={{ select: { native: true } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                >
                    <option value={1}>男</option>
                    <option value={2}>女</option>
                    <option value={3}>未知</option>
                </TextField>
                <TextField
                    label="角色"
                    select
                    value={form.role ?? '普通角色'}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    fullWidth
                    slotProps={{ select: { native: true } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                >
                    <option value="管理员">管理员</option>
                    <option value="普通角色">普通角色</option>
                </TextField>
                {isEditMode ? (
                    <TextField
                        label="在职状态"
                        select
                        value={form.workStatus ?? 1}
                        onChange={(e) => setForm({ ...form, workStatus: Number(e.target.value) })}
                        fullWidth
                        slotProps={{ select: { native: true } }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    >
                        <option value={1}>在职</option>
                        <option value={0}>离职</option>
                    </TextField>
                ) : null}
            </Box>
            {/* 账号状态 */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={form.canLogin === 1}
                            onChange={(e) => setForm({ ...form, canLogin: e.target.checked ? 1 : 0 })}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#667eea' },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#667eea',
                                },
                            }}
                        />
                    }
                    label="后台权限"
                    sx={{ mr: 2 }}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={form.loginStatus === 1}
                            onChange={(e) => setForm({ ...form, loginStatus: e.target.checked ? 1 : 0 })}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#667eea' },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#667eea',
                                },
                            }}
                        />
                    }
                    label="账号状态"
                    sx={{ mr: 2 }}
                />
                {!isEditMode && (
                    <TextField
                        label="初始密码"
                        type="password"
                        value={form.password ?? ''}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        slotProps={{ htmlInput: { autocomplete: 'new-password' } }}
                    />
                )}
            </Box>
            {/* 备注 */}
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
                        员工管理
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        管理系统员工信息和在职状态
                    </Typography>
                </Box>
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
                    sx={{ mb: 3, borderRadius: '12px' }}
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
                                <TableCell sx={{ fontWeight: 600, color: '#64748b', pl: 3, py: 1.5 }}>员工信息</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>岗位</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>联系方式</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>性别</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>年龄</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>角色</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>状态</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>入职日期</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5, pr: 3 }}>
                                    操作
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} sx={{ color: '#667eea' }} />
                                    </TableCell>
                                </TableRow>
                            ) : list.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={10}
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
                                            key={emp.employeeId}
                                            hover
                                            sx={{
                                                '&:hover': { background: '#f8fafc' },
                                                transition: 'background 0.2s ease',
                                            }}
                                        >
                                            <TableCell sx={{ pl: 3, py: 1.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    {emp.avatar ? (
                                                        <Avatar
                                                            src={emp.avatar}
                                                            sx={{ width: 36, height: 36, fontWeight: 600 }}
                                                        />
                                                    ) : (
                                                        <Avatar
                                                            sx={{
                                                                width: 36,
                                                                height: 36,
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                fontWeight: 600,
                                                                fontSize: 14,
                                                            }}
                                                        >
                                                            {getInitials(emp.realName)}
                                                        </Avatar>
                                                    )}
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {emp.realName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ID: {emp.employeeId}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center" sx={{ py: 1.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {emp.department || '—'}
                                                    {emp.department && emp.position && ' / '}
                                                    {emp.position || ''}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" sx={{ py: 1.5 }}>
                                                <Typography variant="body2">{emp.phone}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {emp.email || '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" sx={{ py: 1.5 }}>
                                                <Chip
                                                    icon={g.icon}
                                                    label={g.label}
                                                    color={g.color}
                                                    size="small"
                                                    sx={{
                                                        height: 26,
                                                        '& .MuiChip-icon': { fontSize: 15 },
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center" sx={{ py: 1.5 }}>
                                                <Typography variant="body2">
                                                    {emp.age ? `${emp.age}岁` : '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={emp.role || '普通角色'}
                                                    size="small"
                                                    sx={{
                                                        height: 24,
                                                        fontWeight: 500,
                                                        background: emp.role === '管理员' ? '#fef3c7' : '#f0fdf4',
                                                        color: emp.role === '管理员' ? '#d97706' : '#16a34a',
                                                        border: emp.role === '管理员' ? '1px solid #fde68a' : '1px solid #bbf7d0',
                                                        '& .MuiChip-label': { px: 1 },
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center" sx={{ py: 1.5 }}>
                                                <Chip
                                                    label={emp.workStatus === 1 ? '在职' : '离职'}
                                                    color={emp.workStatus === 1 ? 'success' : 'default'}
                                                    size="small"
                                                    sx={{ height: 24, fontWeight: 500, '& .MuiChip-label': { px: 1 } }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2">
                                                    {emp.createTime ? emp.createTime.split(' ')[0] : '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" sx={{ py: 1.5, pr: 3 }}>
                                                <Tooltip title="编辑">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenEdit(emp)}
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
                <DialogTitle sx={{ pb: 2, pt: 3, px: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        编辑员工
                    </Typography>
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
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        确认删除
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">
                        确定要删除员工 <strong>{deleteTarget?.realName}</strong>（ID: {deleteTarget?.employeeId}）吗？
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
