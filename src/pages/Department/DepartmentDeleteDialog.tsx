// src/pages/Department/DepartmentDeleteDialog.tsx
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog'
import type { IDepartment } from '../../types/department'

export interface DepartmentDeleteDialogProps {
    open: boolean
    target: IDepartment | null
    deleting: boolean
    onConfirm: () => void
    onClose: () => void
}

export function DepartmentDeleteDialog({
    open,
    target,
    deleting,
    onConfirm,
    onClose,
}: DepartmentDeleteDialogProps) {
    return (
        <DeleteConfirmDialog
            open={open}
            entityType="部门"
            entityName={target?.deptName ?? ''}
            deleting={deleting}
            onConfirm={onConfirm}
            onClose={onClose}
        />
    )
}
