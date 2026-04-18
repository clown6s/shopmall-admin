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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled, alpha } from '@mui/material/styles';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import type { TreeItemProps } from '@mui/x-tree-view/TreeItem';
import * as React from "react";
import { toTreeViewItems } from "../types/product.ts";
import {getProductCategoryTreeApi, deleteCategoryApi} from "../api/product.ts";



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
}

const CustomTreeItem = React.forwardRef<HTMLLIElement, React.ComponentProps<typeof CustomTreeItemRoot> & CustomTreeItemProps>(
    ({ label, onEdit, onDelete, ...props }, ref) => {
        const handleEdit = (e: React.MouseEvent) => {
            e.stopPropagation();
            onEdit(props.itemId);
        };

        const handleDelete = (e: React.MouseEvent) => {
            e.stopPropagation();
            onDelete(props.itemId);
        };

        return (
            <CustomTreeItemRoot
                ref={ref}
                {...props}
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', '& .action-buttons': { opacity: 0 }, '&:hover .action-buttons': { opacity: 1 } }}>
                        <span style={{ flex: 1 }}>{label}</span>
                        <Box className="action-buttons" sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" onClick={handleEdit} sx={{ p: 0.25 }}>
                                <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton size="small" onClick={handleDelete} sx={{ p: 0.25, color: 'error.main' }}>
                                <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Box>
                    </Box>
                }
            />
        );
    }
);



export default function ProductCategory() {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [items, setItems] = React.useState<ReturnType<typeof toTreeViewItems>>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [deletingId, setDeletingId] = React.useState<string | null>(null);

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
            // 删除成功后刷新列表
            const res = await getProductCategoryTreeApi();
            setItems(toTreeViewItems(res.data.data || []));
        } catch (err) {
            console.error('删除分类失败:', err);
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

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Box sx={{ p: 2 }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            ) : (
                <Box ref={containerRef} sx={{ width: 300, height: 'calc(100% - 50px)', overflow: 'auto' }}>
                    <RichTreeView
                        defaultExpandedItems={['grid']}
                        items={items}
                        slots={{ item: (props: TreeItemProps) => (
                            <CustomTreeItem
                                {...props}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}}
                    />
                </Box>
            )}
        </>
    );
}