// TODO: 此 hook 过大(616行)，应拆分为:
// - useCategoryTree: 分类CRUD和树状态
// - useBrandManager: 品牌CRUD、缓存、选择
// - useDialogState: 通用对话框状态
// - useSnackbar: 简单snackbar状态
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { CategoryTreeItem, Brand } from '../../types/product';
import { toTreeViewItems, toShowStatus, fromShowStatus } from '../../types/product';
import {
    getProductCategoryTreeApi,
    deleteCategoryApi,
    addCategoryApi,
    updateCategoryApi,
    getBrandsByCategoryApi,
    addBrandApi,
    updateBrandApi,
    deleteBrandApi,
} from '../../api/product';
import useUserStore from '../../store/useUserStore';
import { getApiErrorMsg } from '../../utils/errorHelper';
import type { CategoryDialogData, BrandDialogData, SnackbarState } from './types';

// 品牌缓存：带 TTL（60秒）
interface CacheEntry { data: Brand[]; timestamp: number }
const CACHE_TTL = 60_000;

// 扁平化树形数据，用于下拉选择（带缩进显示层级）
interface FlattenCategory {
    id: string;
    name: string;
    level: number;
    catLevel: number;
    parentCid: number;
}

const flattenCategories = (
    items: readonly CategoryTreeItem[],
    level = 0,
    parentId = 0
): FlattenCategory[] => {
    let result: FlattenCategory[] = [];
    for (const item of items) {
        result.push({ id: item.id, name: item.label as string, level, catLevel: level + 1, parentCid: parentId });
        if (item.children && item.children.length > 0) {
            result = result.concat(flattenCategories(item.children, level + 1, Number(item.id)));
        }
    }
    return result;
};

// 从树中查找分类节点
const findCategoryById = (nodes: readonly CategoryTreeItem[], targetId: string): CategoryTreeItem | null => {
    for (const node of nodes) {
        if (node.id === targetId) return node;
        if (node.children) {
            const found = findCategoryById(node.children, targetId);
            if (found) return found;
        }
    }
    return null;
};

export interface UseCategoryDataReturn {
    // refs
    containerRef: React.RefObject<HTMLDivElement | null>;
    brandsCache: React.MutableRefObject<Map<string, CacheEntry>>;

    // 分类树数据
    items: readonly CategoryTreeItem[];
    setItems: React.Dispatch<React.SetStateAction<readonly CategoryTreeItem[]>>;
    loading: boolean;
    error: string | null;
    computedFlatCategories: FlattenCategory[];

    // 添加/编辑分类对话框
    addDialogOpen: boolean;
    setAddDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    editDialogOpen: boolean;
    setEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    editingId: string | null;
    setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
    newCategory: CategoryDialogData;
    setNewCategory: React.Dispatch<React.SetStateAction<CategoryDialogData>>;
    editCategory: CategoryDialogData;
    setEditCategory: React.Dispatch<React.SetStateAction<CategoryDialogData>>;

    // 删除分类对话框
    deleteDialogOpen: boolean;
    setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    deletingId: string | null;
    setDeletingId: React.Dispatch<React.SetStateAction<string | null>>;

    // 品牌数据
    selectedCategoryId: string | null;
    setSelectedCategoryId: React.Dispatch<React.SetStateAction<string | null>>;
    selectedCategoryName: string;
    setSelectedCategoryName: React.Dispatch<React.SetStateAction<string>>;
    brands: Brand[];
    setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
    brandsLoading: boolean;
    setBrandsLoading: React.Dispatch<React.SetStateAction<boolean>>;

    // 添加品牌对话框
    addBrandDialogOpen: boolean;
    setAddBrandDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    newBrand: BrandDialogData;
    setNewBrand: React.Dispatch<React.SetStateAction<BrandDialogData>>;

    // 编辑品牌对话框
    editBrandDialogOpen: boolean;
    setEditBrandDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    editingBrand: Brand | null;
    setEditingBrand: React.Dispatch<React.SetStateAction<Brand | null>>;
    editBrand: BrandDialogData;
    setEditBrand: React.Dispatch<React.SetStateAction<BrandDialogData>>;

    // 删除品牌对话框
    deleteBrandDialogOpen: boolean;
    setDeleteBrandDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    deletingBrand: Brand | null;
    setDeletingBrand: React.Dispatch<React.SetStateAction<Brand | null>>;

    // 其他
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canCreateBrand: boolean;
    canEditBrand: boolean;
    canDeleteBrand: boolean;
    snackbar: SnackbarState;
    setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>;

    // 方法
    showSnackbar: (message: string, severity: 'success' | 'error' | 'warning') => void;
    handleOpenAddDialog: (parentId?: string) => void;
    handleAddChild: (parentId: string) => void;
    handleCloseAddDialog: () => void;
    handleConfirmAdd: () => Promise<void>;
    handleEdit: (id: string) => void;
    handleCloseEditDialog: () => void;
    handleConfirmEdit: () => Promise<void>;
    handleDelete: (id: string) => void;
    handleConfirmDelete: () => Promise<void>;
    handleCancelDelete: () => void;
    handleSelectCategory: (cat: FlattenCategory) => void;
    loadBrands: (catId: string) => Promise<void>;
    handleOpenAddBrandDialog: () => void;
    handleCloseAddBrandDialog: () => void;
    handleConfirmAddBrand: () => Promise<void>;
    handleOpenEditBrandDialog: (brand: Brand) => void;
    handleCloseEditBrandDialog: () => void;
    handleConfirmEditBrand: () => Promise<void>;
    handleOpenDeleteBrandDialog: (brand: Brand) => void;
    handleCloseDeleteBrandDialog: () => void;
    handleConfirmDeleteBrand: () => Promise<void>;
    handleSnackbarClose: () => void;
}

export function useCategoryData(): UseCategoryDataReturn {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [items, setItems] = useState<readonly CategoryTreeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success',
    });
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCategory, setEditCategory] = useState<CategoryDialogData>({
        name: '',
        parentCid: 0,
        catLevel: 1,
        showStatus: true,
        sort: 0,
    });
    const [newCategory, setNewCategory] = useState<CategoryDialogData>({
        name: '',
        parentCid: 0,
        catLevel: 1,
        showStatus: true,
        sort: 0,
    });
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
    const [brands, setBrands] = useState<Brand[]>([]);
    const [brandsLoading, setBrandsLoading] = useState(false);
    const [addBrandDialogOpen, setAddBrandDialogOpen] = useState(false);
    const [newBrand, setNewBrand] = useState<BrandDialogData>({
        name: '',
        logo: '',
        description: '',
        showStatus: true,
        firstLetter: '',
        sort: 0,
    });
    const [editBrandDialogOpen, setEditBrandDialogOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [editBrand, setEditBrand] = useState<BrandDialogData>({
        name: '',
        logo: '',
        description: '',
        showStatus: true,
        firstLetter: '',
        sort: 0,
    });
    const [deleteBrandDialogOpen, setDeleteBrandDialogOpen] = useState(false);
    const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);

    
    const hasPermission = useUserStore((s) => s.hasPermission);
    // 分类权限
    const canCreateCategory = hasPermission('product:category:create');
    const canEditCategory = hasPermission('product:category:update');
    const canDeleteCategory = hasPermission('product:category:delete');
    // 品牌权限
    const canCreateBrand = hasPermission('product:brand:create');
    const canEditBrand = hasPermission('product:brand:update');
    const canDeleteBrand = hasPermission('product:brand:delete');
    const brandsCache = useRef<Map<string, CacheEntry>>(new Map());

    // 实时计算扁平化分类
    const computedFlatCategories = useMemo(() => flattenCategories(items), [items]);

    // 显示提示
    const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'warning') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    // 关闭提示
    const handleSnackbarClose = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    // 打开添加分类弹窗（可选父分类ID）
    const handleOpenAddDialog = useCallback((parentId?: string) => {
        if (parentId) {
            const parent = computedFlatCategories.find(c => c.id === parentId);
            const parentLevel = parent ? parent.level + 2 : 2;
            setNewCategory({
                name: '',
                parentCid: Number(parentId),
                catLevel: Math.min(parentLevel, 3),
                showStatus: true,
                sort: 0,
            });
        } else {
            setNewCategory({
                name: '',
                parentCid: 0,
                catLevel: 1,
                showStatus: true,
                sort: 0,
            });
        }
        setAddDialogOpen(true);
    }, [computedFlatCategories]);

    // 添加子分类（从节点触发）
    const handleAddChild = useCallback((parentId: string) => {
        handleOpenAddDialog(parentId);
    }, [handleOpenAddDialog]);

    // 关闭添加分类弹窗
    const handleCloseAddDialog = useCallback(() => {
        setAddDialogOpen(false);
    }, []);

    // 确认添加分类
    const handleConfirmAdd = useCallback(async () => {
        if (!newCategory.name.trim()) {
            showSnackbar('请输入分类名称', 'error');
            return;
        }
        try {
            await addCategoryApi({
                name: newCategory.name,
                parentCid: newCategory.parentCid,
                catLevel: newCategory.catLevel,
                showStatus: toShowStatus(newCategory.showStatus),
                sort: newCategory.sort,
            });
            const res = await getProductCategoryTreeApi();
            setItems(toTreeViewItems(res.data || []));
            showSnackbar('添加成功', 'success');
            handleCloseAddDialog();
        } catch (err) {
            if (import.meta.env.DEV) console.error('添加分类失败:', err);
            showSnackbar(`添加失败${getApiErrorMsg(err) ? '：' + getApiErrorMsg(err) : ''}`, 'error');
        }
    }, [newCategory, showSnackbar, handleCloseAddDialog]);

    // 编辑分类 - 打开编辑弹窗
    const handleEdit = useCallback((id: string) => {
        const cat = computedFlatCategories.find(c => c.id === id);
        if (!cat) return;

        const category = findCategoryById(items, id);
        if (category) {
            setEditingId(id);
            setEditCategory({
                name: category.label as string,
                parentCid: cat.parentCid,
                catLevel: cat.catLevel,
                showStatus: fromShowStatus(category.showStatus ?? 2),
                sort: category.sort ?? 0,
            });
            setEditDialogOpen(true);
        }
    }, [computedFlatCategories, items]);

    // 关闭编辑弹窗
    const handleCloseEditDialog = useCallback(() => {
        setEditDialogOpen(false);
        setEditingId(null);
    }, []);

    // 确认修改分类
    const handleConfirmEdit = useCallback(async () => {
        if (!editCategory.name.trim()) {
            showSnackbar('分类名称不能为空', 'error');
            return;
        }
        if (!editingId) return;

        try {
            await updateCategoryApi(editingId, {
                name: editCategory.name,
                showStatus: toShowStatus(editCategory.showStatus),
                sort: editCategory.sort,
            });
            const res = await getProductCategoryTreeApi();
            setItems(toTreeViewItems(res.data || []));
            showSnackbar('修改成功', 'success');
            setEditDialogOpen(false);
        } catch (err) {
            if (import.meta.env.DEV) console.error('修改分类失败:', err);
            showSnackbar(`修改失败${getApiErrorMsg(err) ? '：' + getApiErrorMsg(err) : ''}`, 'error');
        }
    }, [editCategory, editingId, showSnackbar]);

    // 删除分类 - 打开确认框
    const handleDelete = useCallback((id: string) => {
        setDeletingId(id);
        setDeleteDialogOpen(true);
    }, []);

    // 确认删除
    const handleConfirmDelete = useCallback(async () => {
        if (!deletingId) return;
        try {
            await deleteCategoryApi(deletingId);
            const res = await getProductCategoryTreeApi();
            setItems(toTreeViewItems(res.data || []));
            showSnackbar('删除成功', 'success');
            if (String(deletingId) === selectedCategoryId) {
                setSelectedCategoryId(null);
                setSelectedCategoryName('');
                setBrands([]);
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error('删除分类失败:', err);
            showSnackbar(`删除失败${getApiErrorMsg(err) ? '：' + getApiErrorMsg(err) : ''}`, 'error');
        } finally {
            setDeleteDialogOpen(false);
            setDeletingId(null);
        }
    }, [deletingId, selectedCategoryId, showSnackbar]);

    // 取消删除
    const handleCancelDelete = useCallback(() => {
        setDeleteDialogOpen(false);
        setDeletingId(null);
    }, []);

    // 加载品牌列表（带 TTL 缓存）
    const loadBrands = useCallback(async (catId: string) => {
        if (catId === null) return;

        const cached = brandsCache.current.get(catId);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            setBrands(cached.data);
            return;
        }

        setBrandsLoading(true);
        try {
            const res = await getBrandsByCategoryApi(catId);
            const data = res.data || [];
            brandsCache.current.set(catId, { data, timestamp: Date.now() });
            setBrands(data);
        } catch (err) {
            if (import.meta.env.DEV) console.error('加载品牌失败:', err);
            setBrands([]);
        } finally {
            setBrandsLoading(false);
        }
    }, []);

    // 选中分类 - 加载品牌列表
    const handleSelectCategory = useCallback((cat: FlattenCategory) => {
        if (cat.catLevel === 3) {
            setSelectedCategoryId(cat.id);
            setSelectedCategoryName(cat.name);
            loadBrands(cat.id);
        } else {
            setSelectedCategoryId(null);
            setSelectedCategoryName('');
            setBrands([]);
        }
    }, [loadBrands]);

    // 打开添加品牌弹窗
    const handleOpenAddBrandDialog = useCallback(() => {
        if (!selectedCategoryId) {
            showSnackbar('请先选择一个三级分类', 'warning');
            return;
        }
        setNewBrand({
            name: '',
            logo: '',
            description: '',
            showStatus: true,
            firstLetter: '',
            sort: 0,
        });
        setAddBrandDialogOpen(true);
    }, [selectedCategoryId, showSnackbar]);

    // 关闭添加品牌弹窗
    const handleCloseAddBrandDialog = useCallback(() => {
        setAddBrandDialogOpen(false);
    }, []);

    // 确认添加品牌
    const handleConfirmAddBrand = useCallback(async () => {
        if (!newBrand.name.trim()) {
            showSnackbar('品牌名称不能为空', 'error');
            return;
        }
        if (!selectedCategoryId) {
            showSnackbar('请先选择一个三级分类', 'error');
            return;
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
            });
            if (selectedCategoryId) {
                brandsCache.current.delete(selectedCategoryId)
                loadBrands(selectedCategoryId);
            }
            showSnackbar('添加成功', 'success');
            handleCloseAddBrandDialog();
        } catch (err) {
            if (import.meta.env.DEV) console.error('添加品牌失败:', err);
            showSnackbar(`添加失败${getApiErrorMsg(err) ? '：' + getApiErrorMsg(err) : ''}`, 'error');
        }
    }, [newBrand, selectedCategoryId, loadBrands, showSnackbar, handleCloseAddBrandDialog]);

    // 打开编辑品牌弹窗
    const handleOpenEditBrandDialog = useCallback((brand: Brand) => {
        setEditingBrand(brand);
        setEditBrand({
            name: brand.name,
            logo: brand.logo,
            description: brand.description,
            showStatus: fromShowStatus(brand.showStatus),
            firstLetter: brand.firstLetter,
            sort: brand.sort,
        });
        setEditBrandDialogOpen(true);
    }, []);

    // 关闭编辑品牌弹窗
    const handleCloseEditBrandDialog = useCallback(() => {
        setEditBrandDialogOpen(false);
        setEditingBrand(null);
    }, []);

    // 确认编辑品牌
    const handleConfirmEditBrand = useCallback(async () => {
        if (!editBrand.name.trim()) {
            showSnackbar('品牌名称不能为空', 'error');
            return;
        }
        if (!editingBrand) return;
        try {
            await updateBrandApi(editingBrand.brandId, {
                name: editBrand.name,
                logo: editBrand.logo,
                description: editBrand.description,
                showStatus: toShowStatus(editBrand.showStatus),
                firstLetter: editBrand.firstLetter,
                sort: editBrand.sort,
            });
            if (selectedCategoryId) {
                brandsCache.current.delete(selectedCategoryId)
                loadBrands(selectedCategoryId);
            }
            showSnackbar('更新成功', 'success');
            handleCloseEditBrandDialog();
        } catch (err) {
            if (import.meta.env.DEV) console.error('更新品牌失败:', err);
            showSnackbar(`更新失败${getApiErrorMsg(err) ? '：' + getApiErrorMsg(err) : ''}`, 'error');
        }
    }, [editBrand, editingBrand, selectedCategoryId, loadBrands, showSnackbar, handleCloseEditBrandDialog]);

    // 打开删除品牌确认框
    const handleOpenDeleteBrandDialog = useCallback((brand: Brand) => {
        setDeletingBrand(brand);
        setDeleteBrandDialogOpen(true);
    }, []);

    // 关闭删除品牌确认框
    const handleCloseDeleteBrandDialog = useCallback(() => {
        setDeleteBrandDialogOpen(false);
        setDeletingBrand(null);
    }, []);

    // 确认删除品牌
    const handleConfirmDeleteBrand = useCallback(async () => {
        if (!deletingBrand) return;
        try {
            await deleteBrandApi(deletingBrand.brandId);
            if (selectedCategoryId) {
                brandsCache.current.delete(selectedCategoryId)
                loadBrands(selectedCategoryId);
            }
            showSnackbar('删除成功', 'success');
            handleCloseDeleteBrandDialog();
        } catch (err) {
            if (import.meta.env.DEV) console.error('删除品牌失败:', err);
            showSnackbar(`删除失败${getApiErrorMsg(err) ? '：' + getApiErrorMsg(err) : ''}`, 'error');
        }
    }, [deletingBrand, selectedCategoryId, loadBrands, showSnackbar, handleCloseDeleteBrandDialog]);

    // 加载分类数据
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await getProductCategoryTreeApi();
                setItems(toTreeViewItems(res.data || []));
            } catch (err) {
                if (import.meta.env.DEV) console.error('加载分类失败:', err);
                setError('加载分类数据失败，请重试');
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    return {
        containerRef,
        brandsCache,
        items,
        setItems,
        loading,
        error,
        computedFlatCategories,
        addDialogOpen,
        setAddDialogOpen,
        editDialogOpen,
        setEditDialogOpen,
        editingId,
        setEditingId,
        newCategory,
        setNewCategory,
        editCategory,
        setEditCategory,
        deleteDialogOpen,
        setDeleteDialogOpen,
        deletingId,
        setDeletingId,
        selectedCategoryId,
        setSelectedCategoryId,
        selectedCategoryName,
        setSelectedCategoryName,
        brands,
        setBrands,
        brandsLoading,
        setBrandsLoading,
        addBrandDialogOpen,
        setAddBrandDialogOpen,
        newBrand,
        setNewBrand,
        editBrandDialogOpen,
        setEditBrandDialogOpen,
        editingBrand,
        setEditingBrand,
        editBrand,
        setEditBrand,
        deleteBrandDialogOpen,
        setDeleteBrandDialogOpen,
        deletingBrand,
        setDeletingBrand,
        canCreate: canCreateCategory,
        canEdit: canEditCategory,
        canDelete: canDeleteCategory,
        canCreateBrand,
        canEditBrand,
        canDeleteBrand,
        snackbar,
        setSnackbar,
        showSnackbar,
        handleOpenAddDialog,
        handleAddChild,
        handleCloseAddDialog,
        handleConfirmAdd,
        handleEdit,
        handleCloseEditDialog,
        handleConfirmEdit,
        handleDelete,
        handleConfirmDelete,
        handleCancelDelete,
        handleSelectCategory,
        loadBrands,
        handleOpenAddBrandDialog,
        handleCloseAddBrandDialog,
        handleConfirmAddBrand,
        handleOpenEditBrandDialog,
        handleCloseEditBrandDialog,
        handleConfirmEditBrand,
        handleOpenDeleteBrandDialog,
        handleCloseDeleteBrandDialog,
        handleConfirmDeleteBrand,
        handleSnackbarClose,
    };
}
