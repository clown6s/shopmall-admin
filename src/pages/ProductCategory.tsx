import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Avatar from '@mui/material/Avatar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BusinessIcon from '@mui/icons-material/Business';
import { styled, alpha } from '@mui/material/styles';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import type { TreeItemProps } from '@mui/x-tree-view/TreeItem';
import * as React from "react";
import { toTreeViewItems, type CategoryTreeItem, type Brand } from "../types/product.ts";
import {getProductCategoryTreeApi, deleteCategoryApi, addCategoryApi, updateCategoryApi, getBrandsByCategoryApi} from "../api/product.ts";

// 扁平化树形数据，用于下拉选择（带缩进显示层级）
interface FlattenCategory {
    id: string;
    name: string;
    level: number;
    catLevel: number;
    parentCid: number;
}
const flattenCategories = (
    items: CategoryTreeItem[],
    level = 0
): FlattenCategory[] => {
    let result: FlattenCategory[] = [];
    for (const item of items) {
        result.push({ id: item.id, name: item.label as string, level, catLevel: item.catLevel, parentCid: item.parentCid });
        if (item.children && item.children.length > 0) {
            result = result.concat(flattenCategories(item.children, level + 1));
        }
    }
    return result;
};

const CustomTreeItemRoot = styled(TreeItem)(({ theme }) => ({
    color: theme.palette.grey[200],
    [`& .${treeItemClasses.content}`]: {
        borderRadius: theme.spacing(0.5),
        padding: theme.spacing(0.5, 1),
        margin: theme.spacing(0.2, 0),
        [`& .${treeItemClasses.label}`]: {
            fontSize: '0.8rem',
            fontWeight: 500,
        },
    },
    [`& .${treeItemClasses.iconContainer}`]: {
        borderRadius: '50%',
        padding: theme.spacing(0, 1.2),
        ...theme.applyStyles('light', {
        }),
        ...theme.applyStyles('dark', {
            color: theme.palette.primary.contrastText,
        }),
    },
    [`& .${treeItemClasses.groupTransition}`]: {
        marginLeft: 15,
        paddingLeft: 18,
        borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
    ...theme.applyStyles('light', {
        color: theme.palette.grey[800],
    }),
}));

interface CustomTreeItemProps {
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onAddChild: (id: string) => void;
    level?: number;
}

const CustomTreeItem = React.forwardRef<HTMLLIElement, React.ComponentProps<typeof CustomTreeItemRoot> & CustomTreeItemProps>(
    ({ label, onEdit, onDelete, onAddChild, level, ...props }, ref) => {
        const handleEdit = (e: React.MouseEvent) => {
            e.stopPropagation();
            onEdit(props.itemId);
        };

        const handleDelete = (e: React.MouseEvent) => {
            e.stopPropagation();
            onDelete(props.itemId);
        };

        const handleAddChild = (e: React.MouseEvent) => {
            e.stopPropagation();
            onAddChild(props.itemId);
        };

        // catLevel=3 的分类不显示添加子分类按钮
        const canAddChild = level !== undefined && level < 3;

        return (
            <CustomTreeItemRoot
                ref={ref}
                {...props}
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', '& .action-buttons': { opacity: 0 }, '&:hover .action-buttons': { opacity: 1 } }}>
                        <span style={{ flex: 1 }}>{label}</span>
                        <Box className="action-buttons" sx={{ display: 'flex', gap: 0.5 }}>
                            {canAddChild && (
                                <Tooltip title="添加子分类">
                                    <IconButton size="small" onClick={handleAddChild} sx={{ p: 0.25, color: 'primary.main' }}>
                                        <AddIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Tooltip title="编辑">
                                <IconButton size="small" onClick={handleEdit} sx={{ p: 0.25 }}>
                                    <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="删除">
                                <IconButton size="small" onClick={handleDelete} sx={{ p: 0.25, color: 'error.main' }}>
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                }
            />
        );
    }
);



export default function ProductCategory() {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [items, setItems] = React.useState<CategoryTreeItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [deletingId, setDeletingId] = React.useState<string | null>(null);
    const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });
    const [addDialogOpen, setAddDialogOpen] = React.useState(false);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<number | null>(null);
    const [editCategory, setEditCategory] = React.useState({
        name: '',
        parentCid: 0,
        catLevel: 1,
        showStatus: true,
        sort: 0,
        icon: '',
        productUnit: '',
    });

    // 实时计算扁平化分类，用于树节点显示和下拉选择
    const computedFlatCategories = React.useMemo(() => flattenCategories(items), [items]);
    const [newCategory, setNewCategory] = React.useState({
        name: '',
        parentCid: 0,
        catLevel: 1,
        showStatus: true,
        sort: 0,
        icon: '',
        productUnit: '',
    });

    // 当前选中的分类ID（用于加载品牌）
    const [selectedCategoryId, setSelectedCategoryId] = React.useState<number | null>(null);
    const [selectedCategoryName, setSelectedCategoryName] = React.useState<string>('');
    const [brands, setBrands] = React.useState<Brand[]>([]);
    const [brandsLoading, setBrandsLoading] = React.useState(false);

    // 显示提示
    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    // 关闭提示
    const handleSnackbarClose = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // 打开添加分类弹窗（可选父分类ID）
    const handleOpenAddDialog = (parentId?: string) => {
        if (parentId) {
            // 有父分类，自动计算层级
            const parent = computedFlatCategories.find(c => c.id === parentId);
            const parentLevel = parent ? parent.level + 2 : 2;
            setNewCategory({
                name: '',
                parentCid: Number(parentId),
                catLevel: Math.min(parentLevel, 3),
                showStatus: true,
                sort: 0,
                icon: '',
                productUnit: '',
            });
        } else {
            // 无父分类，顶级分类
            setNewCategory({
                name: '',
                parentCid: 0,
                catLevel: 1,
                showStatus: true,
                sort: 0,
                icon: '',
                productUnit: '',
            });
        }
        setAddDialogOpen(true);
    };

    // 添加子分类（从节点触发）
    const handleAddChild = (parentId: string) => {
        handleOpenAddDialog(parentId);
    };

    // 关闭添加分类弹窗
    const handleCloseAddDialog = () => {
        setAddDialogOpen(false);
    };

    // 确认修改分类
    const handleConfirmEdit = async () => {
        if (!editCategory.name.trim()) {
            showSnackbar('分类名称不能为空', 'error');
            return;
        }
        if (!editingId) return;
        
        try {
            await updateCategoryApi(editingId, {
                name: editCategory.name,
                parentCid: editCategory.parentCid, // 保留原有父级
                showStatus: editCategory.showStatus ? 1 : 0,
                sort: editCategory.sort,
                icon: editCategory.icon,
                productUnit: editCategory.productUnit,
            });
            // 刷新列表
            const res = await getProductCategoryTreeApi();
            setItems(toTreeViewItems(res.data.data || []));
            showSnackbar('修改成功', 'success');
            setEditDialogOpen(false);
        } catch (err) {
            console.error('修改分类失败:', err);
            showSnackbar('修改失败', 'error');
        }
    };

    // 关闭编辑弹窗
    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
        setEditingId(null);
    };

    // 确认添加分类
    const handleConfirmAdd = async () => {
        if (!newCategory.name.trim()) {
            showSnackbar('请输入分类名称', 'error');
            return;
        }
        try {
            await addCategoryApi({
                name: newCategory.name,
                parentCid: newCategory.parentCid,
                catLevel: newCategory.catLevel,
                showStatus: newCategory.showStatus ? 1 : 0,
                sort: newCategory.sort,
                icon: newCategory.icon,
                productUnit: newCategory.productUnit,
            });
            // 刷新列表
            const res = await getProductCategoryTreeApi();
            setItems(toTreeViewItems(res.data.data || []));
            showSnackbar('添加成功', 'success');
            handleCloseAddDialog();
        } catch (err) {
            console.error('添加分类失败:', err);
            showSnackbar('添加失败', 'error');
        }
    };

    // 编辑分类 - 打开编辑弹窗
    const handleEdit = (id: string) => {
        const cat = computedFlatCategories.find(c => c.id === id);
        if (!cat) return;
        
        // 从原始树数据中查找完整信息
        const findCategoryById = (nodes: CategoryTreeItem[], targetId: string): CategoryTreeItem | null => {
            for (const node of nodes) {
                if (node.id === targetId) return node;
                if (node.children) {
                    const found = findCategoryById(node.children, targetId);
                    if (found) return found;
                }
            }
            return null;
        };
        
        const category = findCategoryById(items, id);
        if (category) {
            setEditingId(Number(id));
            setEditCategory({
                name: category.label as string,
                parentCid: cat.parentCid, // 保留原有父级
                catLevel: cat.catLevel,   // 保留原有层级
                showStatus: true,
                sort: 0,
                icon: '',
                productUnit: '',
            });
            setEditDialogOpen(true);
        }
    };

    // 删除分类 - 打开确认框
    const handleDelete = (id: string) => {
        setDeletingId(id);
        setDeleteDialogOpen(true);
    };

    // 确认删除
    const handleConfirmDelete = async () => {
        if (!deletingId) return;
        try {
            await deleteCategoryApi(Number(deletingId));
            const res = await getProductCategoryTreeApi();
            setItems(toTreeViewItems(res.data.data || []));
            showSnackbar('删除成功', 'success');
            // 如果删除的是当前选中的分类，清空品牌列表
            if (Number(deletingId) === selectedCategoryId) {
                setSelectedCategoryId(null);
                setSelectedCategoryName('');
                setBrands([]);
            }
        } catch (err) {
            console.error('删除分类失败:', err);
            showSnackbar('删除失败', 'error');
        } finally {
            setDeleteDialogOpen(false);
            setDeletingId(null);
        }
    };

    // 取消删除
    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setDeletingId(null);
    };

    // 选中分类 - 加载品牌列表
    const handleSelectCategory = (cat: FlattenCategory) => {
        // 只有三级分类才加载品牌
        if (cat.catLevel === 3) {
            setSelectedCategoryId(Number(cat.id));
            setSelectedCategoryName(cat.name);
            loadBrands(Number(cat.id));
        } else {
            // 非三级分类，清空品牌列表
            setSelectedCategoryId(null);
            setSelectedCategoryName('');
            setBrands([]);
        }
    };

    // 加载品牌列表
    const loadBrands = async (catId: number) => {
        if (catId === null) return;
        setBrandsLoading(true);
        try {
            const res = await getBrandsByCategoryApi(catId);
            setBrands(res.data.data || []);
        } catch (err) {
            console.error('加载品牌失败:', err);
            setBrands([]);
        } finally {
            setBrandsLoading(false);
        }
    };

    // 加载分类数据
    React.useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await getProductCategoryTreeApi();
                setItems(toTreeViewItems(res.data.data || []));
            } catch (err) {
                console.error('加载分类失败:', err);
                setError('加载分类数据失败，请重试');
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    return (
        <>
            {/* 删除确认对话框 */}
            <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
                <DialogTitle>确认删除</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        确定要删除该分类吗？删除后无法恢复。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>取消</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        删除
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 添加分类对话框 */}
            <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ pb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddIcon color="primary" />
                        添加分类
                        <Chip 
                            label={`${newCategory.catLevel === 1 ? '一级' : newCategory.catLevel === 2 ? '二级' : '三级'}分类`}
                            size="small"
                            color={newCategory.catLevel === 1 ? 'primary' : newCategory.catLevel === 2 ? 'secondary' : 'default'}
                            sx={{ ml: 1 }}
                        />
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    {/* 父分类信息 */}
                    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="text.secondary">
                            父级分类
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                            {newCategory.parentCid === 0 
                                ? '🏠 顶级分类（无父级）' 
                                : `📁 ${computedFlatCategories.find(c => c.id === String(newCategory.parentCid))?.name || '未知分类'}`}
                        </Typography>
                    </Paper>

                    <TextField
                        autoFocus
                        label="分类名称"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleConfirmAdd();
                            }
                        }}
                        fullWidth
                        required
                        placeholder="请输入分类名称"
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="排序"
                            type="number"
                            value={newCategory.sort}
                            onChange={(e) => setNewCategory({ ...newCategory, sort: Number(e.target.value) })}
                            sx={{ flex: 1 }}
                            size="small"
                            slotProps={{ input: { inputProps: { min: 0 } } }}
                        />

                        <TextField
                            label="计量单位"
                            value={newCategory.productUnit}
                            onChange={(e) => setNewCategory({ ...newCategory, productUnit: e.target.value })}
                            placeholder="件、个、箱"
                            sx={{ flex: 1 }}
                            size="small"
                        />
                    </Box>

                    <TextField
                        label="图标地址"
                        value={newCategory.icon}
                        onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                        size="small"
                        placeholder="输入图标URL"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={newCategory.showStatus}
                                onChange={(e) => setNewCategory({ ...newCategory, showStatus: e.target.checked })}
                            />
                        }
                        label={newCategory.showStatus ? '✅ 显示' : '❌ 隐藏'}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseAddDialog}>取消</Button>
                    <Button onClick={handleConfirmAdd} variant="contained" startIcon={<AddIcon />}>
                        添加
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 编辑分类对话框 */}
            <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ pb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EditIcon color="primary" />
                        编辑分类
                        <Chip 
                            label={`ID: ${editingId}`}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1 }}
                        />
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    {/* 分类基本信息卡片 */}
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'primary.50', borderColor: 'primary.main' }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            📋 分类信息
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">层级</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {(() => {
                                        const cat = computedFlatCategories.find(c => c.id === String(editingId));
                                        return cat?.catLevel === 1 ? '🏠 一级分类' : cat?.catLevel === 2 ? '📁 二级分类' : '📄 三级分类';
                                    })()}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">当前状态</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {editCategory.showStatus ? '🟢 显示中' : '⚫ 已隐藏'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <TextField
                        autoFocus
                        label="分类名称"
                        value={editCategory.name}
                        onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleConfirmEdit();
                            }
                        }}
                        fullWidth
                        required
                        placeholder="请输入分类名称"
                        error={!editCategory.name.trim()}
                        helperText={!editCategory.name.trim() ? '分类名称不能为空' : ''}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="排序"
                            type="number"
                            value={editCategory.sort}
                            onChange={(e) => setEditCategory({ ...editCategory, sort: Number(e.target.value) })}
                            sx={{ flex: 1 }}
                            size="small"
                            slotProps={{ input: { inputProps: { min: 0 } } }}
                        />

                        <TextField
                            label="计量单位"
                            value={editCategory.productUnit}
                            onChange={(e) => setEditCategory({ ...editCategory, productUnit: e.target.value })}
                            placeholder="件、个、箱"
                            sx={{ flex: 1 }}
                            size="small"
                        />
                    </Box>

                    <TextField
                        label="图标地址"
                        value={editCategory.icon}
                        onChange={(e) => setEditCategory({ ...editCategory, icon: e.target.value })}
                        size="small"
                        placeholder="输入图标URL"
                        slotProps={{
                            input: {
                                startAdornment: editCategory.icon ? (
                                    <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                                        <img src={editCategory.icon} alt="icon" height={20} style={{ borderRadius: 4 }} />
                                    </Box>
                                ) : null
                            }
                        }}
                    />

                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={editCategory.showStatus}
                                    onChange={(e) => setEditCategory({ ...editCategory, showStatus: e.target.checked })}
                                    color="success"
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    {editCategory.showStatus ? (
                                        <><CheckCircleIcon color="success" fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />显示该分类</>
                                    ) : (
                                        <><CancelIcon color="error" fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />隐藏该分类</>
                                    )}
                                </Typography>
                            }
                        />
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseEditDialog}>取消</Button>
                    <Button onClick={handleConfirmEdit} variant="contained" color="primary" startIcon={<EditIcon />}>
                        保存修改
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 提示消息 */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* 主内容区 - 左右分栏 */}
            <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 120px)' }}>
                {/* 左侧：商品分类树 */}
                <Box sx={{ flex: '0 0 350px', display: 'flex', flexDirection: 'column' }}>
                    {/* 标题栏 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon color="primary" />
                            商品分类
                        </Typography>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Box sx={{ p: 2 }}>
                            <Typography color="error">{error}</Typography>
                        </Box>
                    ) : (
                        <Box ref={containerRef} sx={{ flex: 1, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                            <RichTreeView
                                defaultExpandedItems={['grid']}
                                items={items}
                                slots={{ item: (props: TreeItemProps) => {
                                    const cat = computedFlatCategories.find(c => c.id === props.itemId);
                                    return (
                                        <CustomTreeItem
                                            {...props}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onAddChild={handleAddChild}
                                            level={cat?.catLevel}
                                        />
                                    );
                                }}}
                                onItemClick={(_event, itemId) => {
                                    const cat = computedFlatCategories.find(c => c.id === itemId);
                                    if (cat) {
                                        handleSelectCategory(cat);
                                    }
                                }}
                            />
                        </Box>
                    )}
                </Box>

                {/* 右侧：品牌列表 */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* 标题栏 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon color="primary" />
                            品牌分类
                            {selectedCategoryName && (
                                <Chip 
                                    label={selectedCategoryName}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ ml: 1 }}
                                />
                            )}
                        </Typography>
                    </Box>

                    {/* 品牌表格 */}
                    {selectedCategoryId === null ? (
                        <Paper sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                            <Typography color="text.secondary">
                                👈 请选择右侧分类树中的三级分类查看关联品牌
                            </Typography>
                        </Paper>
                    ) : brandsLoading ? (
                        <Paper sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Paper>
                    ) : brands.length === 0 ? (
                        <Paper sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                            <Typography color="text.secondary">
                                该分类暂未关联任何品牌
                            </Typography>
                        </Paper>
                    ) : (
                        <Paper sx={{ flex: 1, overflow: 'auto' }}>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: 'grey.100' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', width: 80 }}>Logo</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>品牌名称</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', width: 100 }}>首字母</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', width: 80 }}>状态</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', width: 80 }}>排序</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>描述</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {brands.map((brand) => (
                                            <TableRow key={brand.brandId} hover>
                                                <TableCell>
                                                    <Avatar 
                                                        src={brand.logo} 
                                                        variant="rounded"
                                                        sx={{ width: 40, height: 40 }}
                                                    >
                                                        {brand.name.charAt(0)}
                                                    </Avatar>
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 500 }}>{brand.name}</TableCell>
                                                <TableCell>
                                                    <Chip label={brand.firstLetter || '-'} size="small" variant="outlined" />
                                                </TableCell>
                                                <TableCell>
                                                    {brand.showStatus === 1 ? (
                                                        <Chip label="显示" size="small" color="success" variant="filled" />
                                                    ) : (
                                                        <Chip label="隐藏" size="small" color="default" variant="outlined" />
                                                    )}
                                                </TableCell>
                                                <TableCell>{brand.sort}</TableCell>
                                                <TableCell sx={{ maxWidth: 200 }}>
                                                    <Typography variant="body2" noWrap title={brand.descript}>
                                                        {brand.descript || '-'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}
                </Box>
            </Box>
        </>
    );
}
