import { useState, useRef, useCallback } from 'react'
import type { Brand } from '../../../types/product'
import { toShowStatus, fromShowStatus } from '../../../types/product'
import {
    getBrandsByCategoryApi,
    addBrandApi,
    updateBrandApi,
    deleteBrandApi,
} from '../../../api/product'
import { getApiErrorMsg } from '../../../utils/errorHelper'
import type { BrandDialogData, FlattenCategory } from '../types'

// 品牌缓存：带 TTL（60秒）
interface CacheEntry { data: Brand[]; timestamp: number }
const CACHE_TTL = 60_000

export interface UseBrandManagerReturn {
    brandsCache: React.MutableRefObject<Map<string, CacheEntry>>

    selectedCategoryId: string | null
    setSelectedCategoryId: React.Dispatch<React.SetStateAction<string | null>>
    selectedCategoryName: string
    setSelectedCategoryName: React.Dispatch<React.SetStateAction<string>>
    brands: Brand[]
    setBrands: React.Dispatch<React.SetStateAction<Brand[]>>
    brandsLoading: boolean
    setBrandsLoading: React.Dispatch<React.SetStateAction<boolean>>

    addBrandDialogOpen: boolean
    setAddBrandDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
    newBrand: BrandDialogData
    setNewBrand: React.Dispatch<React.SetStateAction<BrandDialogData>>

    editBrandDialogOpen: boolean
    setEditBrandDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
    editingBrand: Brand | null
    setEditingBrand: React.Dispatch<React.SetStateAction<Brand | null>>
    editBrand: BrandDialogData
    setEditBrand: React.Dispatch<React.SetStateAction<BrandDialogData>>

    deleteBrandDialogOpen: boolean
    setDeleteBrandDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
    deletingBrand: Brand | null
    setDeletingBrand: React.Dispatch<React.SetStateAction<Brand | null>>

    handleSelectCategory: (cat: FlattenCategory) => void
    loadBrands: (catId: string) => Promise<void>
    handleOpenAddBrandDialog: () => void
    handleCloseAddBrandDialog: () => void
    handleConfirmAddBrand: () => Promise<void>
    handleOpenEditBrandDialog: (brand: Brand) => void
    handleCloseEditBrandDialog: () => void
    handleConfirmEditBrand: () => Promise<void>
    handleOpenDeleteBrandDialog: (brand: Brand) => void
    handleCloseDeleteBrandDialog: () => void
    handleConfirmDeleteBrand: () => Promise<void>
    clearBrandSelection: () => void
}

const DEFAULT_BRAND_FORM: BrandDialogData = {
    name: '', logo: '', description: '',
    showStatus: true, firstLetter: '', sort: 0,
}

export function useBrandManager(
    showSnackbar: (message: string, severity: 'success' | 'error' | 'warning') => void
): UseBrandManagerReturn {
    const brandsCache = useRef<Map<string, CacheEntry>>(new Map())
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
    const [selectedCategoryName, setSelectedCategoryName] = useState<string>('')
    const [brands, setBrands] = useState<Brand[]>([])
    const [brandsLoading, setBrandsLoading] = useState(false)

    const [addBrandDialogOpen, setAddBrandDialogOpen] = useState(false)
    const [newBrand, setNewBrand] = useState<BrandDialogData>({ ...DEFAULT_BRAND_FORM })
    const [editBrandDialogOpen, setEditBrandDialogOpen] = useState(false)
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
    const [editBrand, setEditBrand] = useState<BrandDialogData>({ ...DEFAULT_BRAND_FORM })
    const [deleteBrandDialogOpen, setDeleteBrandDialogOpen] = useState(false)
    const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null)

    const loadBrands = useCallback(async (catId: string) => {
        if (catId === null) return
        const cached = brandsCache.current.get(catId)
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            setBrands(cached.data)
            return
        }
        setBrandsLoading(true)
        try {
            const res = await getBrandsByCategoryApi(catId)
            const data = res.data || []
            brandsCache.current.set(catId, { data, timestamp: Date.now() })
            setBrands(data)
        } catch (err) {
            if (import.meta.env.DEV) console.error('加载品牌失败:', err)
            setBrands([])
        } finally {
            setBrandsLoading(false)
        }
    }, [])

    const invalidateBrandCache = useCallback((catId: string) => {
        brandsCache.current.delete(catId)
        if (catId === selectedCategoryId) {
            loadBrands(catId)
        }
    }, [selectedCategoryId, loadBrands])

    const handleSelectCategory = useCallback((cat: FlattenCategory) => {
        if (cat.catLevel === 3) {
            setSelectedCategoryId(cat.id)
            setSelectedCategoryName(cat.name)
            loadBrands(cat.id)
        } else {
            setSelectedCategoryId(null)
            setSelectedCategoryName('')
            setBrands([])
        }
    }, [loadBrands])

    const clearBrandSelection = useCallback(() => {
        setSelectedCategoryId(null)
        setSelectedCategoryName('')
        setBrands([])
    }, [])

    const handleOpenAddBrandDialog = useCallback(() => {
        if (!selectedCategoryId) {
            showSnackbar('请先选择一个三级分类', 'warning')
            return
        }
        setNewBrand({ ...DEFAULT_BRAND_FORM })
        setAddBrandDialogOpen(true)
    }, [selectedCategoryId, showSnackbar])

    const handleCloseAddBrandDialog = useCallback(() => {
        setAddBrandDialogOpen(false)
    }, [])

    const handleConfirmAddBrand = useCallback(async () => {
        if (!newBrand.name.trim()) {
            showSnackbar('品牌名称不能为空', 'error')
            return
        }
        if (!selectedCategoryId) {
            showSnackbar('请先选择一个三级分类', 'error')
            return
        }
        try {
            await addBrandApi({
                name: newBrand.name,
                logo: newBrand.logo,
                description: newBrand.description,
                showStatus: toShowStatus(newBrand.showStatus),
                firstLetter: newBrand.firstLetter,
                sort: newBrand.sort,
                catId: Number(selectedCategoryId),
            })
            invalidateBrandCache(selectedCategoryId)
            showSnackbar('添加成功', 'success')
            handleCloseAddBrandDialog()
        } catch (err) {
            if (import.meta.env.DEV) console.error('添加品牌失败:', err)
            showSnackbar(`添加失败${getApiErrorMsg(err) ? '：' + getApiErrorMsg(err) : ''}`, 'error')
        }
    }, [newBrand, selectedCategoryId, invalidateBrandCache, showSnackbar, handleCloseAddBrandDialog])

    const handleOpenEditBrandDialog = useCallback((brand: Brand) => {
        setEditingBrand(brand)
        setEditBrand({
            name: brand.name,
            logo: brand.logo,
            description: brand.description,
            showStatus: fromShowStatus(brand.showStatus),
            firstLetter: brand.firstLetter,
            sort: brand.sort,
        })
        setEditBrandDialogOpen(true)
    }, [])

    const handleCloseEditBrandDialog = useCallback(() => {
        setEditBrandDialogOpen(false)
        setEditingBrand(null)
    }, [])

    const handleConfirmEditBrand = useCallback(async () => {
        if (!editBrand.name.trim()) {
            showSnackbar('品牌名称不能为空', 'error')
            return
        }
        if (!editingBrand) return
        try {
            await updateBrandApi(editingBrand.brandId, {
                name: editBrand.name,
                logo: editBrand.logo,
                description: editBrand.description,
                showStatus: toShowStatus(editBrand.showStatus),
                firstLetter: editBrand.firstLetter,
                sort: editBrand.sort,
            })
            invalidateBrandCache(selectedCategoryId!)
            showSnackbar('更新成功', 'success')
            handleCloseEditBrandDialog()
        } catch (err) {
            if (import.meta.env.DEV) console.error('更新品牌失败:', err)
            showSnackbar(`更新失败${getApiErrorMsg(err) ? '：' + getApiErrorMsg(err) : ''}`, 'error')
        }
    }, [editBrand, editingBrand, selectedCategoryId, invalidateBrandCache, showSnackbar, handleCloseEditBrandDialog])

    const handleOpenDeleteBrandDialog = useCallback((brand: Brand) => {
        setDeletingBrand(brand)
        setDeleteBrandDialogOpen(true)
    }, [])

    const handleCloseDeleteBrandDialog = useCallback(() => {
        setDeleteBrandDialogOpen(false)
        setDeletingBrand(null)
    }, [])

    const handleConfirmDeleteBrand = useCallback(async () => {
        if (!deletingBrand) return
        try {
            await deleteBrandApi(deletingBrand.brandId)
            invalidateBrandCache(selectedCategoryId!)
            showSnackbar('删除成功', 'success')
            handleCloseDeleteBrandDialog()
        } catch (err) {
            if (import.meta.env.DEV) console.error('删除品牌失败:', err)
            showSnackbar(`删除失败${getApiErrorMsg(err) ? '：' + getApiErrorMsg(err) : ''}`, 'error')
        }
    }, [deletingBrand, selectedCategoryId, invalidateBrandCache, showSnackbar, handleCloseDeleteBrandDialog])

    return {
        brandsCache,
        selectedCategoryId, setSelectedCategoryId,
        selectedCategoryName, setSelectedCategoryName,
        brands, setBrands, brandsLoading, setBrandsLoading,
        addBrandDialogOpen, setAddBrandDialogOpen, newBrand, setNewBrand,
        editBrandDialogOpen, setEditBrandDialogOpen, editingBrand, setEditingBrand,
        editBrand, setEditBrand,
        deleteBrandDialogOpen, setDeleteBrandDialogOpen, deletingBrand, setDeletingBrand,
        handleSelectCategory, loadBrands,
        handleOpenAddBrandDialog, handleCloseAddBrandDialog, handleConfirmAddBrand,
        handleOpenEditBrandDialog, handleCloseEditBrandDialog, handleConfirmEditBrand,
        handleOpenDeleteBrandDialog, handleCloseDeleteBrandDialog, handleConfirmDeleteBrand,
        clearBrandSelection,
    }
}
