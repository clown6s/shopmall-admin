// src/pages/ABAC/ABACPolicy.tsx
import { type JSX, useState, useCallback } from 'react'
import {
    Box,
    Typography,
    Button,
    Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import type { ABACPolicy, CreateABACPolicyForm } from '../../types/abac'
import { createABACPolicyApi, updateABACPolicyApi, deleteABACPolicyApi } from '../../api/abac'
import { useABACPolicyData } from './useABACPolicyData'
import { ABACPolicyTable } from './ABACPolicyTable'
import { ABACPolicyDialog } from './ABACPolicyDialog'
import { ABACPolicyDeleteDialog } from './ABACPolicyDeleteDialog'

const DEFAULT_FORM: CreateABACPolicyForm = {
    name: '',
    description: '',
    effect: 'allow',
    priority: 100,
    pathPattern: '',
    departments: '',
    positions: '',
    userIds: '',
    action: '*',
    status: 1,
}

function policyToForm(policy: ABACPolicy): CreateABACPolicyForm {
    const ra = policy.resourceAttrs as Record<string, unknown> | undefined
    const sa = policy.subjectAttrs as Record<string, unknown> | undefined
    const departments = sa?.departments
        ? (sa.departments as string[]).join(', ')
        : ''
    const positions = sa?.positions
        ? (sa.positions as string[]).join(', ')
        : ''
    const userIds = sa?.user_ids
        ? (sa.user_ids as number[]).map(String).join(', ')
        : ''
    return {
        name: policy.name,
        description: policy.description,
        effect: policy.effect,
        priority: policy.priority,
        pathPattern: (ra?.path_pattern as string) || '',
        departments,
        positions,
        userIds,
        action: policy.action,
        status: policy.status,
    }
}

export default function ABACPolicy(): JSX.Element {
    const { list, loading, error, fetchData } = useABACPolicyData()

    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
    const [currentPolicy, setCurrentPolicy] = useState<ABACPolicy | null>(null)
    const [form, setForm] = useState<CreateABACPolicyForm>({ ...DEFAULT_FORM })
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<ABACPolicy | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState('')

    const getErrorMsg = useCallback((err: unknown, fallback: string) => {
        return (
            (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? fallback
        )
    }, [])

    const handleOpenEdit = (policy: ABACPolicy) => {
        setCurrentPolicy(policy)
        setForm(policyToForm(policy))
        setFormError('')
        setDialogMode('edit')
    }

    const handleOpenCreate = () => {
        setForm({ ...DEFAULT_FORM })
        setFormError('')
        setDialogMode('create')
    }

    const handleCreate = async () => {
        setFormError('')
        if (!form.name.trim()) {
            setFormError('策略名称为必填项')
            return
        }
        if (!['allow', 'deny'].includes(form.effect)) {
            setFormError('效果必须是 allow 或 deny')
            return
        }
        if (!['GET', 'POST', 'PUT', 'DELETE', '*'].includes(form.action)) {
            setFormError('请选择有效的 HTTP 方法')
            return
        }
        try {
            setSubmitting(true)
            await createABACPolicyApi(form)
            setDialogMode(null)
            setForm({ ...DEFAULT_FORM })
            await fetchData()
        } catch (err: unknown) {
            setFormError(getErrorMsg(err, '创建失败'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = async () => {
        if (!currentPolicy) return
        setFormError('')
        if (!form.name.trim()) {
            setFormError('策略名称为必填项')
            return
        }
        try {
            setSubmitting(true)
            await updateABACPolicyApi(currentPolicy.id, form)
            setDialogMode(null)
            setCurrentPolicy(null)
            await fetchData()
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
            setDeleteError('')
            await deleteABACPolicyApi(deleteTarget.id)
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
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        策略管理
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        管理 ABAC 访问控制策略（默认拒绝，按优先级匹配）
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
                        新建策略
                    </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                </Alert>
            )}

            {deleteError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setDeleteError('')}>
                    {deleteError}
                </Alert>
            )}

            <ABACPolicyTable
                list={list}
                loading={loading}
                onEdit={handleOpenEdit}
                onDelete={setDeleteTarget}
            />

            <ABACPolicyDialog
                open={dialogMode !== null}
                title={dialogMode === 'edit' ? '编辑策略' : '新建策略'}
                formData={form}
                formError={formError}
                submitting={submitting}
                onFormChange={setForm}
                onSubmit={dialogMode === 'edit' ? handleEdit : handleCreate}
                onClose={() => setDialogMode(null)}
            />

            <ABACPolicyDeleteDialog
                open={Boolean(deleteTarget)}
                target={deleteTarget}
                deleting={deleting}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </Box>
    )
}
