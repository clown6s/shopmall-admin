// src/pages/Users.tsx
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
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import MaleIcon from '@mui/icons-material/Male'
import FemaleIcon from '@mui/icons-material/Female'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import type { IUser, CreateUserForm } from '../types/user'
import { getUsersApi, createUserApi, deleteUserApi } from '../api/user'

const GENDER_MAP: Record<number, { label: string; color: 'primary' | 'secondary' | 'default'; icon: JSX.Element }> = {
    1: { label: '男', color: 'primary', icon: <MaleIcon fontSize="small" /> },
    2: { label: '女', color: 'secondary', icon: <FemaleIcon fontSize="small" /> },
    3: { label: '未知', color: 'default', icon: <QuestionMarkIcon fontSize="small" /> },
}

const DEFAULT_FORM: CreateUserForm = {
    name: '',
    password: '',
    phone: '',
    email: '',
    age: undefined,
    gender: 1,
    deviceInfo: 'web-admin',
    remark: '',
}

export default function Users(): JSX.Element {
    const [list, setList] = useState<IUser[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [openCreate, setOpenCreate] = useState(false)
    const [form, setForm] = useState<CreateUserForm>({ ...DEFAULT_FORM })
    const [formError, setFormError] = useState('')
    const [creating, setCreating] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<IUser | null>(null)
    const [deleting, setDeleting] = useState(false)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const res = await getUsersApi({ page, pageSize, name: search || undefined })
            const d = res.data.data
            setList(d.list)
            setTotal(d.total)
        } catch {
            setError('获取用户列表失败')
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
        if (!form.name || !form.password || !form.phone) {
            setFormError('姓名、密码、手机号为必填项')
            return
        }
        try {
            setCreating(true)
            await createUserApi(form)
            setOpenCreate(false)
            setForm({ ...DEFAULT_FORM })
            fetchData()
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? '创建失败'
            setFormError(msg)
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            await deleteUserApi(deleteTarget.id)
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

    return (
        <Box sx={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        用户管理
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        管理系统用户信息和权限
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
                    新建用户
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
                        placeholder="按姓名搜索用户..."
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
                                <TableCell sx={{ fontWeight: 600, color: '#64748b', pl: 3 }}>用户信息</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>联系方式</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>性别</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>年龄</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>注册时间</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', pr: 3 }}>
                                    操作
                                </TableCell>
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
                                    <TableCell
                                        colSpan={6}
                                        align="center"
                                        sx={{ py: 8, color: 'text.secondary' }}
                                    >
                                        <Box sx={{ textAlign: 'center' }}>
                                            <PersonIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                                            <Typography>暂无用户数据</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                list.map((user) => {
                                    const g = GENDER_MAP[user.gender] ?? GENDER_MAP[3]
                                    return (
                                        <TableRow
                                            key={user.id}
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
                                                        {getInitials(user.name)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {user.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ID: {user.id}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{user.phone}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {user.email || '未设置邮箱'}
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
                                                    {user.age ? `${user.age} 岁` : '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                <Tooltip title="删除用户">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setDeleteTarget(user)}
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
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    },
                }}
            >
                <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
                    <Typography variant="h6" fontWeight={700}>
                        新建用户
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ px: 3, py: 2 }}>
                    {formError && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                            {formError}
                        </Alert>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                                label="密码 *"
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Box>
                        <TextField
                            label="邮箱"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
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
                </DialogContent>
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
                        disabled={creating}
                        sx={{
                            borderRadius: '10px',
                            px: 4,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        }}
                    >
                        {creating ? <CircularProgress size={20} color="inherit" /> : '创建'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                    },
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                        确认删除
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">
                        确定要删除用户 <strong>{deleteTarget?.name}</strong>（ID: {deleteTarget?.id}）吗？
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
