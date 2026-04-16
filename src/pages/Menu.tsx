// src/pages/Menu.tsx
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
import MenuBookIcon from '@mui/icons-material/MenuBook'
import type { IMenu, CreateMenuForm } from '../types/rbac'
import { StatusMap } from '../types/rbac'
import {
    getMenusApi,
    getMenuTreeApi,
    createMenuApi,
    updateMenuApi,
    deleteMenuApi,
} from '../api/rbac'

const DEFAULT_FORM: CreateMenuForm = {
    name: '',
    path: '',
    component: '',
    icon: '',
    sort: 0,
    parentId: 0,
    status: 1,
}

export default function Menu(): JSX.Element {
    const [list, setList] = useState<IMenu[]>([])
    const [menuTree, setMenuTree] = useState<IMenu[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [openCreate, setOpenCreate] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [currentMenu, setCurrentMenu] = useState<IMenu | null>(null)
    const [form, setForm] = useState<CreateMenuForm>({ ...DEFAULT_FORM })
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<IMenu | null>(null)
    const [deleting, setDeleting] = useState(false)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const [listRes, treeRes] = await Promise.all([
                getMenusApi(),
                getMenuTreeApi(),
            ])
            setList(listRes.data.data)
            setMenuTree(treeRes.data.data)
        } catch {
            setError('获取菜单列表失败')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleCreate = async () => {
        setFormError('')
        if (!form.name || !form.path) {
            setFormError('菜单名称和路径为必填项')
            return
        }
        try {
            setSubmitting(true)
            await createMenuApi(form)
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
        if (!currentMenu) return
        setFormError('')
        if (!form.name || !form.path) {
            setFormError('菜单名称和路径为必填项')
            return
        }
        try {
            setSubmitting(true)
            await updateMenuApi(currentMenu.id, form)
            setOpenEdit(false)
            setCurrentMenu(null)
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
            await deleteMenuApi(deleteTarget.id)
            setDeleteTarget(null)
            fetchData()
        } catch {
            setDeleteTarget(null)
        } finally {
            setDeleting(false)
        }
    }

    const renderMenuRows = (items: IMenu[], level = 0): JSX.Element[] => {
        return items.flatMap((menu) => {
            const status = StatusMap[menu.status]
            const row = (
                <TableRow
                    key={menu.id}
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
                                {menu.name}
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
                            {menu.path}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" color="text.secondary">
                            {menu.component || '—'}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" color="text.secondary">
                            {menu.icon || '—'}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2">{menu.sort}</Typography>
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
                                    setCurrentMenu(menu)
                                    setForm({
                                        name: menu.name,
                                        path: menu.path,
                                        component: menu.component,
                                        icon: menu.icon,
                                        sort: menu.sort,
                                        parentId: menu.parentId,
                                        status: menu.status,
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
                                onClick={() => setDeleteTarget(menu)}
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
            const children = menu.children ? renderMenuRows(menu.children, level + 1) : []
            return [row, ...children]
        })
    }

    const renderParentOptions = (items: IMenu[], level = 0): JSX.Element[] => {
        return items.flatMap((menu) => {
            const option = (
                <MenuItem key={menu.id} value={menu.id}>
                    <Box sx={{ pl: level * 2 }}>{menu.name}</Box>
                </MenuItem>
            )
            const children = menu.children ? renderParentOptions(menu.children, level + 1) : []
            return [option, ...children]
        })
    }

    const formFields = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {formError && <Alert severity="error" sx={{ borderRadius: '12px' }}>{formError}</Alert>}
            <TextField
                label="菜单名称 *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
                label="路径 *"
                value={form.path}
                onChange={(e) => setForm({ ...form, path: e.target.value })}
                placeholder="如: /users, /system/role"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
                label="组件"
                value={form.component}
                onChange={(e) => setForm({ ...form, component: e.target.value })}
                placeholder="如: User, Role"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
                label="图标"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="如: People, Settings"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    label="排序"
                    type="number"
                    value={form.sort}
                    onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                <TextField
                    select
                    label="父菜单"
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: Number(e.target.value) })}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                >
                    <MenuItem value={0}>无（顶级菜单）</MenuItem>
                    {renderParentOptions(menuTree)}
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
                        菜单管理
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        管理系统菜单结构和导航
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
                    新建菜单
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
                                <TableCell sx={{ fontWeight: 600, color: '#64748b', pl: 3 }}>菜单名称</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>路径</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>组件</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>图标</TableCell>
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
                                            <MenuBookIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                                            <Typography>暂无菜单数据</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                renderMenuRows(menuTree)
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
                        新建菜单
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
                        编辑菜单
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
                        确定要删除菜单 <strong>{deleteTarget?.name}</strong>（ID: {deleteTarget?.id}）吗？
                        {deleteTarget?.children && deleteTarget.children.length > 0 && (
                            <Box component="span" sx={{ color: 'error.main', display: 'block', mt: 1 }}>
                                警告：该菜单下有子菜单，删除后将一并删除！
                            </Box>
                        )}
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
