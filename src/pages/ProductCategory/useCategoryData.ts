import useUserStore from '../../store/useUserStore'
import type { FlattenCategory, SnackbarState } from './types'
import { useSnackbar } from './hooks/useSnackbar'
import { useCategoryTree, type UseCategoryTreeReturn } from './hooks/useCategoryTree'
import { useBrandManager, type UseBrandManagerReturn } from './hooks/useBrandManager'

export type { UseCategoryTreeReturn, UseBrandManagerReturn }
export type { FlattenCategory, SnackbarState }

export interface UseCategoryDataReturn extends UseCategoryTreeReturn, UseBrandManagerReturn {
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
    canCreateBrand: boolean
    canEditBrand: boolean
    canDeleteBrand: boolean
    snackbar: SnackbarState
    setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>
    showSnackbar: (message: string, severity: 'success' | 'error' | 'warning') => void
    handleSnackbarClose: () => void
    handleConfirmDelete: () => Promise<void>
}

export function useCategoryData(): UseCategoryDataReturn {
    const { snackbar, setSnackbar, showSnackbar, handleSnackbarClose } = useSnackbar()

    const categoryTree = useCategoryTree(showSnackbar)
    const brandManager = useBrandManager(showSnackbar)

    const hasPermission = useUserStore((s) => s.hasPermission)
    const canCreate = hasPermission('product:category:create')
    const canEdit = hasPermission('product:category:update')
    const canDelete = hasPermission('product:category:delete')
    const canCreateBrand = hasPermission('product:brand:create')
    const canEditBrand = hasPermission('product:brand:update')
    const canDeleteBrand = hasPermission('product:brand:delete')

    // 删除分类时联动清理品牌选择
    const handleConfirmDelete = async () => {
        await categoryTree.handleConfirmDelete(() => {
            if (categoryTree.deletingId === brandManager.selectedCategoryId) {
                brandManager.clearBrandSelection()
            }
        })
    }

    return {
        ...categoryTree,
        ...brandManager,
        canCreate, canEdit, canDelete,
        canCreateBrand, canEditBrand, canDeleteBrand,
        snackbar, setSnackbar, showSnackbar, handleSnackbarClose,
        handleConfirmDelete,
    }
}
