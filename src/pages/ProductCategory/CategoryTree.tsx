import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { styled, alpha } from '@mui/material/styles';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import type { TreeItemProps } from '@mui/x-tree-view/TreeItem';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import { useCallback, useMemo } from 'react';
import type { CategoryTreeItem } from '../../types/product';
import type { FlattenCategory, CustomTreeItemProps } from './types';

interface CategoryTreeProps {
    items: readonly CategoryTreeItem[];
    computedFlatCategories: FlattenCategory[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onAddChild: (id: string) => void;
    onSelectCategory: (cat: FlattenCategory) => void;
    isAdmin: boolean;
    loading: boolean;
    error: string | null;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

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
        ...theme.applyStyles('light', {}),
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

const CustomTreeItem = (props: TreeItemProps & CustomTreeItemProps) => {
    const { label, onEdit, onDelete, onAddChild, level, isAdmin, ...rest } = props;

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(rest.itemId);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(rest.itemId);
    };

    const handleAddChild = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddChild(rest.itemId);
    };

    const canAddChild = level !== undefined && level < 3;

    return (
        <CustomTreeItemRoot
            {...rest}
            label={
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', '& .action-buttons': { opacity: 0 }, '&:hover .action-buttons': { opacity: 1 } }}>
                    <span style={{ flex: 1 }}>{label}</span>
                    {isAdmin && (
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
                    )}
                </Box>
            }
        />
    );
};

export default function CategoryTree({
    items,
    computedFlatCategories,
    onEdit,
    onDelete,
    onAddChild,
    onSelectCategory,
    isAdmin,
    loading,
    error,
    containerRef,
}: CategoryTreeProps) {
    // M-5: 使用 useCallback 避免每次渲染重建 slots 回调
    const categoryMap = useMemo(
        () => new Map(computedFlatCategories.map(c => [c.id, c])),
        [computedFlatCategories]
    );
    const renderItem = useCallback((props: TreeItemProps) => {
        const cat = categoryMap.get(props.itemId);
        return (
            <CustomTreeItem
                {...props}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                level={cat?.catLevel}
                isAdmin={isAdmin}
            />
        );
    }, [categoryMap, onEdit, onDelete, onAddChild, isAdmin]);

    return (
        <Box sx={{ flex: '0 0 350px', display: 'flex', flexDirection: 'column' }}>
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
                        slots={{ item: renderItem }}
                        onItemClick={(_event, itemId) => {
                            const cat = categoryMap.get(itemId);
                            if (cat) {
                                onSelectCategory(cat);
                            }
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}
