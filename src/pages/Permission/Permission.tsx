// src/pages/Permission/Permission.tsx
import { type JSX, useState } from 'react'
import {
    Box,
    Typography,
    Button,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    CircularProgress,
    Chip,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import type { IPermission, CreatePermissionForm } from '../../types/permission'
import { createPermissionApi, updatePermissionApi, deletePermissionApi } from '../../api/permission'
import { usePermissionData } from './usePermissionData'
import { PermissionDialog } from './PermissionDialog'
import useUserStore from '../../store/useUserStore'
import { getApiErrorMsg } from '../../utils/errorHelper'

const DEFAULT_FORM: CreatePermissionForm = {
    permissionName: '',
    permissionKey: '',
    type: 1,
    parentId: 0,
    path: '',
    method: '',
    sortOrder: 0,
    status: 1,
}

const TYPE_LABELS: Record<number, string> = { 1: '菜单', 2: '按钮', 3: 'API' }

function permToForm(p: IPermission): CreatePermissionForm {
    return {
        permissionName: p.permissionName,
        permissionKey: p.permissionKey,
        type: p.type,
        parentId: p.parentId,
        path: p.path,
        method: p.method,
        sortOrder: p.sortOrder,
        status: p.status,
    }
}

export default function Permission(): JSX.Element {
    const { list, loading, error, fetchData } = usePermissionData()
    const hasPermission = useUserStore((s) => s.hasPermission)

    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
    const [currentPerm, setCurrentPerm] = useState<IPermission | null>(null)
    const [form, setForm] = useState<CreatePermissionForm>({ ...DEFAULT_FORM })
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<IPermission | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState('')

    const handleOpenEdit = (p: IPermission) => {
        setCurrentPerm(p)
        setForm(permToForm(p))
        setFormError('')
        setDialogMode('edit')
    }

    const handleOpenCreate = () => {
        setForm({ ...DEFAULT_FORM })
        setFormError('')
        setDialogMode('create')
    }

    const handleSubmit = async () => {
        setFormError('')
        if (!form.permissionName.trim()) { setFormError('权限名称为必填项'); return }
        if (!form.permissionKey.trim()) { setFormError('权限标识为必填项'); return }
        if (![1, 2, 3].includes(form.type)) { setFormError('类型必须是 1/2/3'); return }
        try {
            setSubmitting(true)
            if (dialogMode === 'create') {
                await createPermissionApi(form)
            } else if (currentPerm) {
                await updatePermissionApi(currentPerm.id, form)
            }
            setDialogMode(null)
            setCurrentPerm(null)
            await fetchData()
        } catch (err: unknown) {
            setFormError(getApiErrorMsg(err, dialogMode === 'create' ? '创建失败' : '更新失败'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            setDeleteError('')
            await deletePermissionApi(deleteTarget.id)
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>权限管理</Typography>
                    <Typography variant="body2" color="text.secondary">管理系统菜单、按钮、API 权限</Typography>
                </Box>
                {hasPermission('system:permission:create') && (
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{
                        borderRadius: '12px', px: 3, py: 1,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        '&:hover': { background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)' },
                    }}
                >
                    新建权限
                </Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
            {deleteError && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setDeleteError('')}>{deleteError}</Alert>}

            <Paper elevation={0} sx={{ borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ background: '#f8fafc' }}>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>权限名称</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>权限标识</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>类型</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>路径</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>方法</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>排序</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>状态</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}><CircularProgress size={32} sx={{ color: '#667eea' }} /></TableCell></TableRow>
                            ) : !list || list.length === 0 ? (
                                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                    <Box sx={{ textAlign: 'center' }}><VpnKeyIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} /><Typography>暂无权限数据</Typography></Box>
                                </TableCell></TableRow>
                            ) : (
                                list.map((perm) => (
                                    <TableRow key={perm.id} hover sx={{ '&:hover': { background: '#f8fafc' }, transition: 'background 0.2s ease' }}>
                                        <TableCell align="center" sx={{ py: 1.5 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{perm.permissionName}</Typography>
                                        </TableCell>
                                        <TableCell align="center" sx={{ py: 1.5 }}>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#f1f5f9', px: 1, py: 0.5, borderRadius: '6px', display: 'inline-block' }}>
                                                {perm.permissionKey}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center" sx={{ py: 1.5 }}>
                                            <Chip label={TYPE_LABELS[perm.type] || '未知'} size="small" variant="outlined" sx={{ height: 24 }} />
                                        </TableCell>
                                        <TableCell align="center" sx={{ py: 1.5 }}>
                                            <Typography variant="body2" color="text.secondary">{perm.path || '—'}</Typography>
                                        </TableCell>
                                        <TableCell align="center" sx={{ py: 1.5 }}>
                                            <Chip label={perm.method || '不限'} size="small" variant="outlined" sx={{ height: 24, fontFamily: 'monospace', fontSize: '0.75rem' }} />
                                        </TableCell>
                                        <TableCell align="center" sx={{ py: 1.5 }}>
                                            <Typography variant="body2">{perm.sortOrder}</Typography>
                                        </TableCell>
                                        <TableCell align="center" sx={{ py: 1.5 }}>
                                            <Chip label={perm.status === 1 ? '启用' : '禁用'} color={perm.status === 1 ? 'success' : 'default'} size="small" sx={{ height: 24, fontWeight: 500, '& .MuiChip-label': { px: 1 } }} />
                                        </TableCell>
                                        <TableCell align="center" sx={{ py: 1.5, pr: 3 }}>
                                            {hasPermission('system:permission:update') && <Tooltip title="编辑"><IconButton size="small" onClick={() => handleOpenEdit(perm)} sx={{ color: '#64748b', '&:hover': { background: 'rgba(100, 116, 139, 0.1)' } }}><EditIcon fontSize="small" /></IconButton></Tooltip>}
                                            {hasPermission('system:permission:delete') && <Tooltip title="删除"><IconButton size="small" onClick={() => setDeleteTarget(perm)} sx={{ color: '#ef4444', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <PermissionDialog
                open={dialogMode !== null}
                title={dialogMode === 'edit' ? '编辑权限' : '新建权限'}
                formData={form}
                formError={formError}
                submitting={submitting}
                onFormChange={setForm}
                onSubmit={handleSubmit}
                onClose={() => setDialogMode(null)}
            />

            {/* Delete confirmation */}
            <DeleteConfirmDialog
                open={Boolean(deleteTarget)}
                name={deleteTarget?.permissionName ?? ''}
                deleting={deleting}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </Box>
    )
}

function DeleteConfirmDialog({ open, name, deleting, onConfirm, onClose }: {
    open: boolean; name: string; deleting: boolean; onConfirm: () => void; onClose: () => void
}): JSX.Element {
    return (
        <Dialog open={open} onClose={onClose} {...{ disablePortal: true } as any} slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
            <DialogTitle sx={{ fontWeight: 700 }}>确认删除</DialogTitle>
            <DialogContent>
                <Typography color="text.secondary">
                    确定要删除权限 <strong>{name}</strong> 吗？<br />此操作不可撤销。
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} sx={{ borderRadius: '10px' }}>取消</Button>
                <Button variant="contained" color="error" onClick={onConfirm} disabled={deleting} sx={{ borderRadius: '10px' }}>
                    {deleting ? <CircularProgress size={18} color="inherit" /> : '删除'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
