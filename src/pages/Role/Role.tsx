// src/pages/Role/Role.tsx
import { type JSX, useState } from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import type { IRole, CreateRoleForm } from '../../types/role'
import { createRoleApi, updateRoleApi, deleteRoleApi } from '../../api/role'
import { useRoleData } from './useRoleData'
import { RoleTable } from './RoleTable'
import { RoleDialog } from './RoleDialog'
import { RoleDeleteDialog } from './RoleDeleteDialog'
import { RolePermissionDialog } from './RolePermissionDialog'
import useUserStore from '../../store/useUserStore'
import { getApiErrorMsg } from '../../utils/errorHelper'
import { PRIMARY_BUTTON_SX } from '../../utils/theme'

const DEFAULT_FORM: CreateRoleForm = {
    roleName: '',
    roleKey: '',
    description: '',
    status: 1,
}

function roleToForm(role: IRole): CreateRoleForm {
    return {
        roleName: role.roleName,
        roleKey: role.roleKey,
        description: role.description,
        status: role.status,
    }
}

export default function Role(): JSX.Element {
    const { list, loading, error, fetchData } = useRoleData()
    const hasPermission = useUserStore((s) => s.hasPermission)

    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
    const [currentRole, setCurrentRole] = useState<IRole | null>(null)
    const [form, setForm] = useState<CreateRoleForm>({ ...DEFAULT_FORM })
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<IRole | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState('')

    const [permDialogTarget, setPermDialogTarget] = useState<IRole | null>(null)

    const handleOpenEdit = (role: IRole) => {
        setCurrentRole(role)
        setForm(roleToForm(role))
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
        if (!form.roleName.trim()) { setFormError('角色名称为必填项'); return }
        if (!form.roleKey.trim()) { setFormError('角色标识为必填项'); return }
        try {
            setSubmitting(true)
            if (dialogMode === 'create') {
                await createRoleApi({ roleName: form.roleName, roleKey: form.roleKey, description: form.description, status: form.status })
            } else if (currentRole) {
                await updateRoleApi(currentRole.id, { roleName: form.roleName, roleKey: form.roleKey, description: form.description, status: form.status })
            }
            setDialogMode(null)
            setCurrentRole(null)
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
            await deleteRoleApi(deleteTarget.id)
            setDeleteTarget(null)
            fetchData()
        } catch (err: unknown) {
            setDeleteError(getApiErrorMsg(err, '删除失败，请重试'))
        } finally {
            setDeleting(false)
        }
    }

    return (
        <Box sx={{ animation: 'fadeIn 0.3s ease-out' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>角色管理</Typography>
                    <Typography variant="body2" color="text.secondary">管理系统角色及权限分配</Typography>
                </Box>
                {hasPermission('system:role:create') && (
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={PRIMARY_BUTTON_SX}
                >
                    新建角色
                </Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
            {deleteError && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setDeleteError('')}>{deleteError}</Alert>}

            <RoleTable
                list={list}
                loading={loading}
                onEdit={handleOpenEdit}
                onAssignPermissions={setPermDialogTarget}
                onDelete={setDeleteTarget}
                canEdit={hasPermission('system:role:update')}
                canDelete={hasPermission('system:role:delete')}
            />

            <RoleDialog
                open={dialogMode !== null}
                title={dialogMode === 'edit' ? '编辑角色' : '新建角色'}
                formData={form}
                formError={formError}
                submitting={submitting}
                onFormChange={setForm}
                onSubmit={handleSubmit}
                onClose={() => setDialogMode(null)}
            />

            <RoleDeleteDialog
                open={Boolean(deleteTarget)}
                target={deleteTarget}
                deleting={deleting}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />

            <RolePermissionDialog
                open={Boolean(permDialogTarget)}
                roleId={permDialogTarget?.id ?? null}
                roleName={permDialogTarget?.roleName ?? ''}
                onClose={() => setPermDialogTarget(null)}
                onAssigned={fetchData}
            />
        </Box>
    )
}
