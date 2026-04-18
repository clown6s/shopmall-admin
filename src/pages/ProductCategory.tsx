import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { styled, alpha } from '@mui/material/styles';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import type { TreeItemProps } from '@mui/x-tree-view/TreeItem';
import * as React from "react";
import { toTreeViewItems, type CategoryTreeItem } from "../types/product.ts";
import {getProductCategoryTreeApi, deleteCategoryApi, addCategoryApi} from "../api/product.ts";

// 扁平化树形数据，用于下拉选择（带缩进显示层级）
interface FlattenCategory {
    id: string;
    name: string;
    level: number;
    catLevel: number;
}
const flattenCategories = (
    items: CategoryTreeItem[],
    level = 0
): FlattenCategory[] => {
    let result: FlattenCategory[] = [];
    for (const item of items) {
        result.push({ id: item.id, name: item.label as string, level, catLevel: item.catLevel });
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

    // 编辑分类
    const handleEdit = (id: string) => {
        console.log('编辑分类:', id);
        // TODO: 打开编辑弹窗
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
                <DialogTitle sx={{ pb: 1 }}>添加分类</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                    {/* 父分类（只读显示） */}
                    <Box sx={{ 
                        p: 2, 
                        bgcolor: 'grey.50', 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.200'
                    }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            父级分类
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {newCategory.parentCid === 0 
                                ? '顶级分类（无父级）' 
                                : (computedFlatCategories.find(c => c.id === String(newCategory.parentCid))?.name || '未知分类')}
                        </Typography>
                    </Box>

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
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="排序"
                            type="number"
                            value={newCategory.sort}
                            onChange={(e) => setNewCategory({ ...newCategory, sort: Number(e.target.value) })}
                            sx={{ flex: 1 }}
                            size="small"
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
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={newCategory.showStatus}
                                onChange={(e) => setNewCategory({ ...newCategory, showStatus: e.target.checked })}
                            />
                        }
                        label="是否显示"
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseAddDialog}>取消</Button>
                    <Button onClick={handleConfirmAdd} variant="contained">
                        添加
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

            {/* 标题栏 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">商品分类</Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Box sx={{ p: 2 }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            ) : (
                <Box ref={containerRef} sx={{ width: 300, height: 'calc(100% - 70px)', overflow: 'auto' }}>
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
                    />
                </Box>
            )}
        </>
    );
}