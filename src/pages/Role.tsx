// src/pages/Role.tsx
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
    Checkbox,
    Avatar,
    Tooltip,
} from '@mui/material'
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import SecurityIcon from '@mui/icons-material/Security'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import type { IRole, IPermission, CreateRoleForm } from '../types/rbac'
import { StatusMap } from '../types/rbac'
import {
    getRolesApi,
    createRoleApi,
    updateRoleApi,
    deleteRoleApi,
    getRolePermissionsApi,
    assignRolePermissionsApi,
    getPermissionTreeApi,
} from '../api/rbac'

const DEFAULT_FORM: CreateRoleForm = {
    name: '',
    code: '',
    description: '',
    status: 1,
}

export default function Role(): JSX.Element {
    const [list, setList] = useState<IRole[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [openCreate, setOpenCreate] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [openPermissions, setOpenPermissions] = useState(false)
    const [currentRole, setCurrentRole] = useState<IRole | null>(null)
    const [form, setForm] = useState<CreateRoleForm>({ ...DEFAULT_FORM })
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [permissions, setPermissions] = useState<IPermission[]>([])
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
    const [permissionsLoading, setPermissionsLoading] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<IRole | null>(null)
    const [deleting, setDeleting] = useState(false)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const res = await getRolesApi()
            setList(res.data.data)
        } catch {
            setError('获取角色列表失败')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleCreate = async () => {
        setFormError('')
        if (!form.name || !form.code) {
            setFormError('角色名称和编码为必填项')
            return
        }
        try {
            setSubmitting(true)
            await createRoleApi(form)
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
        if (!currentRole) return
        setFormError('')
        if (!form.name || !form.code) {
            setFormError('角色名称和编码为必填项')
            return
        }
        try {
            setSubmitting(true)
            await updateRoleApi(currentRole.id, form)
            setOpenEdit(false)
            setCurrentRole(null)
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
            await deleteRoleApi(deleteTarget.id)
            setDeleteTarget(null)
            fetchData()
        } catch {
            setDeleteTarget(null)
        } finally {
            setDeleting(false)
        }
    }

    const handleOpenPermissions = async (role: IRole) => {
        setCurrentRole(role)
        setOpenPermissions(true)
        setPermissionsLoading(true)
        try {
            const [permsRes, rolePermsRes] = await Promise.all([
                getPermissionTreeApi(),
                getRolePermissionsApi(role.id),
            ])
            setPermissions(permsRes.data.data)
            setSelectedPermissions(rolePermsRes.data.data)
        } catch {
            setError('获取权限数据失败')
        } finally {
            setPermissionsLoading(false)
        }
    }

    const handleSavePermissions = async () => {
        if (!currentRole) return
        try {
            setSubmitting(true)
            await assignRolePermissionsApi(currentRole.id, { permissionIds: selectedPermissions })
            setOpenPermissions(false)
            setCurrentRole(null)
        } catch {
            setError('保存权限失败')
        } finally {
            setSubmitting(false)
        }
    }

    const renderPermissionTree = (items: IPermission[]) => {
        return items.map((item) => (
            <TreeItem
                key={item.id}
                itemId={String(item.id)}
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                        <Checkbox
                            checked={selectedPermissions.includes(item.id)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedPermissions([...selectedPermissions, item.id])
                                } else {
                                    setSelectedPermissions(selectedPermissions.filter((id) => id !== item.id))
                                }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            size="small"
                            sx={{
                                color: '#667eea',
                                '&.Mui-checked': { color: '#667eea' },
                            }}
                        />
                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                            {item.name}
                        </Typography>
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                            ({item.code})
                        </Typography>
                    </Box>
                }
            >
                {item.children && item.children.length > 0 && renderPermissionTree(item.children)}
            </TreeItem>
        ))
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
                        角色管理
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        管理系统角色和权限分配
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
                    新建角色
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
                                <TableCell sx={{ fontWeight: 600, color: '#64748b', pl: 3 }}>角色信息</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>编码</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>描述</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>状态</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>创建时间</TableCell>
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
                                    <TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <AdminPanelSettingsIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                                            <Typography>暂无角色数据</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                list.map((role) => {
                                    const status = StatusMap[role.status]
                                    return (
                                        <TableRow
                                            key={role.id}
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
                                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {getInitials(role.name)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {role.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ID: {role.id}
                                                        </Typography>
                                                    </Box>
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
                                                    {role.code}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {role.description || '—'}
                                                </Typography>
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
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(role.createTime).toLocaleDateString('zh-CN')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                <Tooltip title="分配权限">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenPermissions(role)}
                                                        sx={{
                                                            color: '#667eea',
                                                            '&:hover': { background: 'rgba(102, 126, 234, 0.1)' },
                                                        }}
                                                    >
                                                        <SecurityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="编辑">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setCurrentRole(role)
                                                            setForm({
                                                                name: role.name,
                                                                code: role.code,
                                                                description: role.description,
                                                                status: role.status,
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
                                                        onClick={() => setDeleteTarget(role)}
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
                                })
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
                        新建角色
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
                            label="角色名称 *"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            label="角色编码 *"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value })}
                            placeholder="如: admin, editor"
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            label="描述"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            multiline
                            rows={2}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.status === 1}
                                    onChange={(e) => setForm({ ...form, status: e.target.checked ? 1 : 0 })}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#667eea',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#667eea',
                                        },
                                    }}
                                />
                            }
                            label="启用"
                        />
                    </Box>
                </DialogContent>
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
                        编辑角色
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
                            label="角色名称 *"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            label="角色编码 *"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value })}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            label="描述"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            multiline
                            rows={2}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.status === 1}
                                    onChange={(e) => setForm({ ...form, status: e.target.checked ? 1 : 0 })}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#667eea',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#667eea',
                                        },
                                    }}
                                />
                            }
                            label="启用"
                        />
                    </Box>
                </DialogContent>
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

            {/* Permissions Dialog */}
            <Dialog
                open={openPermissions}
                onClose={() => setOpenPermissions(false)}
                maxWidth="md"
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
                        分配权限 - {currentRole?.name}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ minHeight: 400, px: 3 }}>
                    {permissionsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: '#667eea' }} />
                        </Box>
                    ) : (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                            }}
                        >
                            <SimpleTreeView
                                slots={{
                                    collapseIcon: ExpandMoreIcon,
                                    expandIcon: ChevronRightIcon,
                                }}
                            >
                                {renderPermissionTree(permissions)}
                            </SimpleTreeView>
                        </Paper>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setOpenPermissions(false)}
                        sx={{ borderRadius: '10px', px: 3, color: '#64748b' }}
                    >
                        取消
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSavePermissions}
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
                        确定要删除角色 <strong>{deleteTarget?.name}</strong>（ID: {deleteTarget?.id}）吗？
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
