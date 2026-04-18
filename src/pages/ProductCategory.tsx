import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';

import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';

import { styled, alpha } from '@mui/material/styles';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';

import { toTreeViewItems } from '../types/product';
import { getProductCategoryTreeApi } from '../api/product';


// ================= TreeItem 样式 =================
const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
    [`& .${treeItemClasses.content}`]: {
        borderRadius: theme.spacing(0.5),
        padding: theme.spacing(0.5, 1),
        margin: theme.spacing(0.2, 0),
    },
    [`& .${treeItemClasses.label}`]: {
        fontSize: '0.82rem',
        fontWeight: 500,
    },
    [`& .${treeItemClasses.groupTransition}`]: {
        marginLeft: 14,
        paddingLeft: 16,
        borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.3)}`,
    },
}));


// ================= 主组件 =================
export default function ProductCategory() {

    const [treeItems, setTreeItems] = React.useState<any[]>([]);
    const [expanded, setExpanded] = React.useState<string[]>([]);
    const [selected, setSelected] = React.useState<string>('');

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);


    // ===== 加载分类 =====
    const loadCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await getProductCategoryTreeApi();
            const data = res.data.data || [];

            const items = toTreeViewItems(data); // ⚠️ 必须返回 itemId
            setTreeItems(items);

            // ✅ 自动展开第一层
            const firstLevelIds = items.map((i: any) => i.itemId);
            setExpanded(firstLevelIds);

        } catch (err) {
            console.error(err);
            setError('加载分类失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadCategories();
    }, []);


    // ===== UI 渲染 =====

    const renderContent = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <CircularProgress size={28} />
                </Box>
            );
        }

        if (error) {
            return (
                <Box sx={{ textAlign: 'center', mt: 6 }}>
                    <Typography color="error" sx={{ mb: 1 }}>
                        {error}
                    </Typography>
                    <Button size="small" onClick={loadCategories}>
                        重新加载
                    </Button>
                </Box>
            );
        }

        if (treeItems.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', mt: 6 }}>
                    <Typography color="text.secondary">
                        暂无分类数据
                    </Typography>
                </Box>
            );
        }

        return (
            <RichTreeView
                items={treeItems}
                expandedItems={expanded}
                onExpandedItemsChange={(_, ids) => setExpanded(ids)}
                selectedItems={selected}
                onSelectedItemsChange={(_, id) => setSelected(id || '')}
                slots={{ item: CustomTreeItem }}
            />
        );
    };


    return (
        <Box
            sx={{
                height: 'calc(100vh - 140px)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* 标题栏 */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    商品分类
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="刷新">
                        <IconButton onClick={loadCategories} size="small">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        size="small"
                    >
                        新增分类
                    </Button>
                </Box>
            </Box>

            {/* 分类树 */}
            <Box
                sx={{
                    width: 300,
                    flex: 1,
                    overflow: 'auto',
                }}
            >
                {renderContent()}
            </Box>
        </Box>
    );
}