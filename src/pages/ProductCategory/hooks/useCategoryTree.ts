import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { CategoryTreeItem } from '../../../types/product'
import { toTreeViewItems, toShowStatus, fromShowStatus } from '../../../types/product'
import {
    getProductCategoryTreeApi,
    deleteCategoryApi,
    addCategoryApi,
    updateCategoryApi,
} from '../../../api/product'
import { getApiErrorMsg } from '../../../utils/errorHelper'
import type { CategoryDialogData, FlattenCategory } from '../types'

// 从树中查找分类节点
const findCategoryById = (nodes: readonly CategoryTreeItem[], targetId: string): CategoryTreeItem | null => {
    for (const node of nodes) {
        if (node.id === targetId) return node
        if (node.children) {
            const found = findCategoryById(node.children, targetId)
            if (found) return found
        }
    }
    return null
}

// 扁平化树形数据
const flattenCategories = (
    items: readonly CategoryTreeItem[],
    level = 0,
    parentId = 0
): FlattenCategory[] => {
    let result: FlattenCategory[] = []
    for (const item of items) {
        result.push({ id: item.id, name: item.label as string, level, catLevel: level + 1, parentCid: parentId })
        if (item.children && item.children.length > 0) {
            result = result.concat(flattenCategories(item.children, level + 1, Number(item.id)))
        }
    }
    return result
}

export interface UseCategoryTreeReturn {
    containerRef: React.RefObject<HTMLDivElement | null>
    items: readonly CategoryTreeItem[]
    loading: boolean
    error: string | null
    computedFlatCategories: FlattenCategory[]

    addDialogOpen: boolean
    setAddDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
    editDialogOpen: boolean
    setEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
    editingId: string | null
    setEditingId: React.Dispatch<React.SetStateAction<string | null>>
    newCategory: CategoryDialogData
    setNewCategory: React.Dispatch<React.SetStateAction<CategoryDialogData>>
    editCategory: CategoryDialogData
    setEditCategory: React.Dispatch<React.SetStateAction<CategoryDialogData>>

    deleteDialogOpen: boolean
    setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
    deletingId: string | null
    setDeletingId: React.Dispatch<React.SetStateAction<string | null>>

    handleOpenAddDialog: (parentId?: string) => void
    handleAddChild: (parentId: string) => void
    handleCloseAddDialog: () => void
    handleConfirmAdd: () => Promise<void>
    handleEdit: (id: string) => void
    handleCloseEditDialog: () => void
    handleConfirmEdit: () => Promise<void>
    handleDelete: (id: string) => void
    handleConfirmDelete: (onSuccess?: () => void) => Promise<void>
    handleCancelDelete: () => void
}

export function useCategoryTree(
    showSnackbar: (message: string, severity: 'success' | 'error' | 'warning') => void
): UseCategoryTreeReturn {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [items, setItems] = useState<readonly CategoryTreeItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const [editCategory, setEditCategory] = useState<CategoryDialogData>({
        name: '', parentCid: 0, catLevel: 1, showStatus: true, sort: 0,
    })
    const [newCategory, setNewCategory] = useState<CategoryDialogData>({
        name: '', parentCid: 0, catLevel: 1, showStatus: true, sort: 0,
    })

    const computedFlatCategories = useMemo(() => flattenCategories(items), [items])

    const refreshTree = useCallback(async () => {
        const res = await getProductCategoryTreeApi()
        setItems(toTreeViewItems(res.data || []))
    }, [])

    // 加载分类数据
    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                setError(null)
                await refreshTree()
            } catch (err) {
                if (import.meta.env.DEV) console.error('加载分类失败:', err)
                setError('加载分类数据失败，请重试')
            } finally {
                setLoading(false)
            }
        })()
    }, [refreshTree])

    const handleOpenAddDialog = useCallback((parentId?: string) => {
        if (parentId) {
            const parent = computedFlatCategories.find(c => c.id === parentId)
            const parentLevel = parent ? parent.level + 2 : 2
            setNewCategory({
                name: '', parentCid: Number(parentId),
                catLevel: Math.min(parentLevel, 3), showStatus: true, sort: 0,
            })
        } else {
            setNewCategory({ name: '', parentCid: 0, catLevel: 1, showStatus: true, sort: 0 })
        }
        setAddDialogOpen(true)
    }, [computedFlatCategories])

    const handleAddChild = useCallback((parentId: string) => {
        handleOpenAddDialog(parentId)
    }, [handleOpenAddDialog])

    const handleCloseAddDialog = useCallback(() => {
        setAddDialogOpen(false)
    }, [])

    const handleConfirmAdd = useCallback(async () => {
        if (!newCategory.name.trim()) {
            showSnackbar('请输入分类名称', 'error')
            return
        }
        try {
            await addCategoryApi({
                name: newCategory.name,
                parentCid: newCategory.parentCid,
                catLevel: newCategory.catLevel,
                showStatus: toShowStatus(newCategory.showStatus),
                sort: newCategory.sort,
            })
            await refreshTree()
            showSnackbar('添加成功', 'success')
            handleCloseAddDialog()
        } catch (err) {
            if (import.meta.env.DEV) console.error('添加分类失败:', err)
            showSnackbar(`添加失败${getApiErrorMsg(err) ? '：' + getApiErrorMsg(err) : ''}`, 'error')
        }
    }, [newCategory, showSnackbar, handleCloseAddDialog, refreshTree])

    const handleEdit = useCallback((id: string) => {
        const cat = computedFlatCategories.find(c => c.id === id)
        if (!cat) return
        const category = findCategoryById(items, id)
        if (category) {
            setEditingId(id)
            setEditCategory({
                name: category.label as string,
                parentCid: cat.parentCid,
                catLevel: cat.catLevel,
                showStatus: fromShowStatus(category.showStatus ?? 2),
                sort: category.sort ?? 0,
            })
            setEditDialogOpen(true)
        }
    }, [computedFlatCategories, items])

    const handleCloseEditDialog = useCallback(() => {
        setEditDialogOpen(false)
        setEditingId(null)
    }, [])

    const handleConfirmEdit = useCallback(async () => {
        if (!editCategory.name.trim()) {
            showSnackbar('分类名称不能为空', 'error')
            return
        }
        if (!editingId) return
        try {
            await updateCategoryApi(editingId, {
                name: editCategory.name,
                showStatus: toShowStatus(editCategory.showStatus),
                sort: editCategory.sort,
            })
            await refreshTree()
            showSnackbar('修改成功', 'success')
            setEditDialogOpen(false)
        } catch (err) {
            if (import.meta.env.DEV) console.error('修改分类失败:', err)
            showSnackbar(`修改失败${getApiErrorMsg(err) ? '：' + getApiErrorMsg(err) : ''}`, 'error')
        }
    }, [editCategory, editingId, showSnackbar, refreshTree])

    const handleDelete = useCallback((id: string) => {
        setDeletingId(id)
        setDeleteDialogOpen(true)
    }, [])

    const handleConfirmDelete = useCallback(async (onSuccess?: () => void) => {
        if (!deletingId) return
        try {
            await deleteCategoryApi(deletingId)
            await refreshTree()
            showSnackbar('删除成功', 'success')
            onSuccess?.()
        } catch (err) {
            if (import.meta.env.DEV) console.error('删除分类失败:', err)
            showSnackbar(`删除失败${getApiErrorMsg(err) ? '：' + getApiErrorMsg(err) : ''}`, 'error')
        } finally {
            setDeleteDialogOpen(false)
            setDeletingId(null)
        }
    }, [deletingId, showSnackbar, refreshTree])

    const handleCancelDelete = useCallback(() => {
        setDeleteDialogOpen(false)
        setDeletingId(null)
    }, [])

    return {
        containerRef, items, loading, error, computedFlatCategories,
        addDialogOpen, setAddDialogOpen, editDialogOpen, setEditDialogOpen,
        editingId, setEditingId, newCategory, setNewCategory,
        editCategory, setEditCategory,
        deleteDialogOpen, setDeleteDialogOpen, deletingId, setDeletingId,
        handleOpenAddDialog, handleAddChild, handleCloseAddDialog, handleConfirmAdd,
        handleEdit, handleCloseEditDialog, handleConfirmEdit,
        handleDelete, handleConfirmDelete, handleCancelDelete,
    }
}
