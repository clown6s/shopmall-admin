// src/pages/Role/RoleDeleteDialog.tsx
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog'
import type { IRole } from '../../types/role'

export interface RoleDeleteDialogProps {
    open: boolean
    target: IRole | null
    deleting: boolean
    onConfirm: () => void
    onClose: () => void
}

export function RoleDeleteDialog({ open, target, deleting, onConfirm, onClose }: RoleDeleteDialogProps) {
    return (
        <DeleteConfirmDialog
            open={open}
            entityType="角色"
            entityName={target?.roleName ?? ''}
            deleting={deleting}
            onConfirm={onConfirm}
            onClose={onClose}
        />
    )
}
