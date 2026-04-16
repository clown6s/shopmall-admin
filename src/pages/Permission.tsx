// src/pages/Permission.tsx
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
    Switch,
    FormControlLabel,
    MenuItem,
    Tooltip,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import SecurityIcon from '@mui/icons-material/Security'
import type { IPermission, CreatePermissionForm } from '../types/rbac'
import { StatusMap, PermissionTypeMap } from '../types/rbac'
import {
    getPermissionsApi,
    getPermissionTreeApi,
    createPermissionApi,
    updatePermissionApi,
    deletePermissionApi,
} from '../api/rbac'

const DEFAULT_FORM: CreatePermissionForm = {
    code: '',
    name: '',
    type: 4,
    parentId: 0,
    path: '',
    component: '',
    icon: '',
    sort: 0,
    status: 1,
}

const PERMISSION_TYPES = [
    { value: 1, label: '目录', color: '#8b5cf6' },
    { value: 2, label: '菜单', color: '#3b82f6' },
    { value: 3, label: '按钮', color: '#10b981' },
    { value: 4, label: '接口', color: '#f59e0b' },
]

export default function Permission(): JSX.Element {
    const [list, setList] = useState<IPermission[]>([])
    const [permissionTree, setPermissionTree] = useState<IPermission[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [openCreate, setOpenCreate] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [currentPermission, setCurrentPermission] = useState<IPermission | null>(null)
    const [form, setForm] = useState<CreatePermissionForm>({ ...DEFAULT_FORM })
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<IPermission | null>(null)
    const [deleting, setDeleting] = useState(false)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const [listRes, treeRes] = await Promise.all([
                getPermissionsApi(),
                getPermissionTreeApi(),
            ])
            setList(listRes.data.data)
            setPermissionTree(treeRes.data.data)
        } catch {
            setError('获取权限列表失败')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleCreate = async () => {
        setFormError('')
        if (!form.code || !form.name) {
            setFormError('权限编码和名称为必填项')
            return
        }
        try {
            setSubmitting(true)
            await createPermissionApi(form)
            setOpenCreate(false)
            setForm({ ...DEFAULT_FORM })
            fetchData()
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                '创建失败'
            setFormError(msg)
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = async () => {
        if (!currentPermission) return
        setFormError('')
        if (!form.code || !form.name) {
            setFormError('权限编码和名称为必填项')
            return
        }
        try {
            setSubmitting(true)
            await updatePermissionApi(currentPermission.id, form)
            setOpenEdit(false)
            setCurrentPermission(null)
            fetchData()
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                '更新失败'
            setFormError(msg)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            await deletePermissionApi(deleteTarget.id)
            setDeleteTarget(null)
            fetchData()
        } catch {
            setDeleteTarget(null)
        } finally {
            setDeleting(false)
        }
    }

    const renderPermissionRows = (items: IPermission[], level = 0): JSX.Element[] => {
        return items.flatMap((perm) => {
            const status = StatusMap[perm.status]
            const type = PermissionTypeMap[perm.type]
            const typeConfig = PERMISSION_TYPES.find(t => t.value === perm.type)
            const row = (
                <TableRow
                    key={perm.id}
                    hover
                    sx={{
                        '&:hover': { background: '#f8fafc' },
                        transition: 'background 0.2s ease',
                    }}
                >
                    <TableCell sx={{ pl: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: level * 24 }} />
                            <Typography
                                variant="body2"
                                sx={{ fontWeight: level === 0 ? 600 : 400 }}
                            >
                                {perm.name}
                            </Typography>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: 'monospace',
                                color: 'text.secondary',
                                bgcolor: '#f1f5f9',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '6px',
                                display: 'inline-block',
                            }}
                        >
                            {perm.code}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Chip
                            label={type.label}
                            size="small"
                            sx={{
                                height: 24,
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                background: typeConfig ? `${typeConfig.color}15` : undefined,
                                color: typeConfig?.color,
                                border: `1px solid ${typeConfig ? `${typeConfig.color}30` : 'transparent'}`,
                            }}
                        />
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" color="text.secondary">
                            {perm.path || '—'}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2">{perm.sort}</Typography>
                    </TableCell>
                    <TableCell>
                        <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                            sx={{
                                height: 28,
                                fontWeight: 500,
                                '& .MuiChip-label': { px: 1.5 },
                            }}
                        />
                    </TableCell>
                    <TableCell align="center" sx={{ pr: 3 }}>
                        <Tooltip title="编辑">
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setCurrentPermission(perm)
                                    setForm({
                                        code: perm.code,
                                        name: perm.name,
                                        type: perm.type,
                                        parentId: perm.parentId,
                                        path: perm.path,
                                        component: perm.component,
                                        icon: perm.icon,
                                        sort: perm.sort,
                                        status: perm.status,
                                    })
                                    setFormError('')
                                    setOpenEdit(true)
                                }}
                                sx={{
                                    color: '#64748b',
                                    '&:hover': { background: 'rgba(100, 116, 139, 0.1)' },
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="删除">
                            <IconButton
                                size="small"
                                onClick={() => setDeleteTarget(perm)}
                                sx={{
                                    color: '#ef4444',
                                    '&:hover': { background: 'rgba(239, 68, 68, 0.1)' },
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                </TableRow>
            )
            const children = perm.children && perm.children.length > 0
                ? renderPermissionRows(perm.children, level + 1)
                : []
            return [row, ...children]
        })
    }

    const renderParentOptions = (items: IPermission[], level = 0): JSX.Element[] => {
        return items.flatMap((perm) => {
            const option = (
                <MenuItem key={perm.id} value={perm.id}>
                    <Box sx={{ pl: level * 2 }}>{perm.name}</Box>
                </MenuItem>
            )
            const children = perm.children && perm.children.length > 0
                ? renderParentOptions(perm.children, level + 1)
                : []
            return [option, ...children]
        })
    }

    const formFields = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {formError && <Alert severity="error" sx={{ borderRadius: '12px' }}>{formError}</Alert>}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    select
                    label="权限类型 *"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: Number(e.target.value) })}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                >
                    {PERMISSION_TYPES.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: t.color,
                                    }}
                                />
                                {t.label}
                            </Box>
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="排序"
                    type="number"
                    value={form.sort}
                    onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
            </Box>
            <TextField
                label="权限编码 *"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="如: system:user:list, system:user:create"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
                label="权限名称 *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="如: 用户列表, 创建用户"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
                select
                label="父权限"
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: Number(e.target.value) })}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            >
                <MenuItem value={0}>无（顶级权限）</MenuItem>
                {renderParentOptions(permissionTree)}
            </TextField>
            {(form.type === 1 || form.type === 2) && (
                <TextField
                    label="路径"
                    value={form.path}
                    onChange={(e) => setForm({ ...form, path: e.target.value })}
                    placeholder="如: /users, /system/role"
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
            )}
            {(form.type === 1 || form.type === 2) && (
                <TextField
                    label="组件"
                    value={form.component}
                    onChange={(e) => setForm({ ...form, component: e.target.value })}
                    placeholder="如: User, Role"
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
            )}
            {(form.type === 1 || form.type === 2) && (
                <TextField
                    label="图标"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="如: People, Settings"
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
            )}
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
                label="启用"
            />
        </Box>
    )

    return (
        <Box sx={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        权限管理
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        管理系统权限和访问控制
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
                    }}
                >
                    新建权限
                </Button>
            </Box>

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
                                <TableCell sx={{ fontWeight: 600, color: '#64748b', pl: 3 }}>权限名称</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>权限编码</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>类型</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>路径</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>排序</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>状态</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', pr: 3 }}>
                                    操作
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} sx={{ color: '#667eea' }} />
                                    </TableCell>
                                </TableRow>
                            ) : list.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <SecurityIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                                            <Typography>暂无权限数据</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                renderPermissionRows(permissionTree)
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
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
                        新建权限
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
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    },
                }}
            >
                <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
                    <Typography variant="h6" fontWeight={700}>
                        编辑权限
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ px: 3, py: 2 }}>{formFields}</DialogContent>
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
                PaperProps={{
                    sx: { borderRadius: '20px' },
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                        确认删除
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">
                        确定要删除权限 <strong>{deleteTarget?.name}</strong>（ID: {deleteTarget?.id}）吗？
                        <Box component="span" sx={{ color: 'error.main', display: 'block', mt: 1 }}>
                            警告：删除权限可能影响角色授权，请谨慎操作！
                        </Box>
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
