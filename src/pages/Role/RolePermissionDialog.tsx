// src/pages/Role/RolePermissionDialog.tsx
import { type JSX, useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Typography,
    Box,
    Divider,
} from '@mui/material'
import type { IPermission } from '../../types/permission'
import { getPermissionsApi } from '../../api/permission'
import { getRolePermissionIdsApi, assignPermissionsApi } from '../../api/role'
import { DIALOG_PAPER_SLOT_PROPS } from '../../utils/dialog'

export interface RolePermissionDialogProps {
    open: boolean
    roleId: number | null
    roleName: string
    onClose: () => void
    onAssigned: () => void
}

export function RolePermissionDialog({ open, roleId, roleName, onClose, onAssigned }: RolePermissionDialogProps): JSX.Element {
    const [permissions, setPermissions] = useState<IPermission[]>([])
    const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!open || !roleId) return
        let cancelled = false
        setLoading(true)
        setError('')
        Promise.all([
            getPermissionsApi().then((r) => r.data as IPermission[]),
            getRolePermissionIdsApi(roleId).then((r) => r.data as number[]),
        ])
            .then(([perms, ids]) => {
                if (!cancelled) {
                    setPermissions(perms)
                    setCheckedIds(new Set(ids))
                }
            })
            .catch(() => { if (!cancelled) setError('加载权限数据失败') })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [open, roleId])

    const handleToggle = (id: number) => {
        setCheckedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleSelectAll = () => {
        if (checkedIds.size === permissions.length) {
            setCheckedIds(new Set())
        } else {
            setCheckedIds(new Set(permissions.map((p) => p.id)))
        }
    }

    const handleSave = async () => {
        if (!roleId) return
        setSubmitting(true)
        setError('')
        try {
            await assignPermissionsApi(roleId, Array.from(checkedIds))
            onAssigned()
            onClose()
        } catch {
            setError('保存失败')
        } finally {
            setSubmitting(false)
        }
    }

    // Build tree structure for rendering
    const topLevel = permissions.filter((p) => p.parentId === 0)
    const childrenMap = new Map<number, IPermission[]>()
    permissions.forEach((p) => {
        if (p.parentId !== 0) {
            const arr = childrenMap.get(p.parentId) || []
            arr.push(p)
            childrenMap.set(p.parentId, arr)
        }
    })

    const renderTreeItem = (perm: IPermission, depth: number) => {
        const children = childrenMap.get(perm.id) || []
        return (
            <Box key={perm.id}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={checkedIds.has(perm.id)}
                            onChange={() => handleToggle(perm.id)}
                            size="small"
                            sx={{ color: '#6366f1', '&.Mui-checked': { color: '#6366f1' } }}
                        />
                    }
                    label={
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                                {perm.permissionName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {perm.permissionKey}
                            </Typography>
                        </Box>
                    }
                    sx={{ pl: depth * 3, py: 0.25 }}
                />
                {children.map((child) => renderTreeItem(child, depth + 1))}
            </Box>
        )
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            disablePortal
            slotProps={DIALOG_PAPER_SLOT_PROPS}
        >
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                分配权限 - {roleName}
            </DialogTitle>
            <DialogContent sx={{ px: 3, pt: '24px !important', pb: 2 }}>
                <Box>
                    {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={32} sx={{ color: '#667eea' }} />
                        </Box>
                    ) : permissions.length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>暂无权限数据</Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checkedIds.size === permissions.length}
                                        indeterminate={checkedIds.size > 0 && checkedIds.size < permissions.length}
                                        onChange={handleSelectAll}
                                        size="small"
                                        sx={{ color: '#6366f1', '&.Mui-checked': { color: '#6366f1' } }}
                                    />
                                }
                                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>全选</Typography>}
                            />
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                {topLevel.map((perm) => renderTreeItem(perm, 0))}
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} sx={{ borderRadius: '10px', px: 3, color: '#64748b' }}>取消</Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={submitting || loading}
                    sx={{ borderRadius: '10px', px: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}
                >
                    {submitting ? <CircularProgress size={20} color="inherit" /> : '保存'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
