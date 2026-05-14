// src/pages/ABAC/ABACPolicyDeleteDialog.tsx
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog'
import type { ABACPolicy } from '../../types/abac'

export interface ABACPolicyDeleteDialogProps {
    open: boolean
    target: ABACPolicy | null
    deleting: boolean
    onConfirm: () => void
    onClose: () => void
}

export function ABACPolicyDeleteDialog({
    open,
    target,
    deleting,
    onConfirm,
    onClose,
}: ABACPolicyDeleteDialogProps) {
    return (
        <DeleteConfirmDialog
            open={open}
            entityType="策略"
            entityName={target?.name ?? ''}
            deleting={deleting}
            onConfirm={onConfirm}
            onClose={onClose}
        />
    )
}
