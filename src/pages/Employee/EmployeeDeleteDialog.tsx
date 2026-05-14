// src/pages/Employee/EmployeeDeleteDialog.tsx
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog'
import type { IEmployee } from '../../types/employee'

interface EmployeeDeleteDialogProps {
    open: boolean
    target: IEmployee | null
    deleting: boolean
    onConfirm: () => void
    onClose: () => void
}

export function EmployeeDeleteDialog({
    open,
    target,
    deleting,
    onConfirm,
    onClose,
}: EmployeeDeleteDialogProps) {
    const displayName = target
        ? `${target.realName}（ID: ${target.id}）`
        : ''

    return (
        <DeleteConfirmDialog
            open={open}
            entityType="员工"
            entityName={displayName}
            deleting={deleting}
            onConfirm={onConfirm}
            onClose={onClose}
        />
    )
}
