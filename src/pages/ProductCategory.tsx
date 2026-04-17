import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import type {TreeViewSelectionPropagation} from '@mui/x-tree-view/models';
import { toTreeViewItems } from '../types/product';
import { getProductCategoryTreeApi } from '../api/product';

// 默认父子联动选中
const DEFAULT_SELECTION_PROPAGATION: TreeViewSelectionPropagation = {
    parents: true,
    descendants: true,
};

export default function ProductCategory() {
    // 分类数据状态
    const [treeItems, setTreeItems] = React.useState<ReturnType<typeof toTreeViewItems>>([]);
    const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // 加载分类数据
    const loadCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getProductCategoryTreeApi();
            const items = toTreeViewItems(res.data.data || []);
            setTreeItems(items);
        } catch (err) {
            console.error('加载分类失败:', err);
            setError('加载分类数据失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadCategories();
    }, []);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* 标题栏 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    商品分类
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="刷新">
                        <IconButton onClick={loadCategories} size="small">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Button variant="contained" startIcon={<AddIcon />} size="small">
                        新增分类
                    </Button>
                </Box>
            </Box>

            {/* 分类树卡片 */}
            <Card sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : treeItems.length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            暂无分类数据
                        </Typography>
                    ) : (
                        <RichTreeView
                            items={treeItems}
                            expandedItems={expandedItems}
                            onExpandedItemsChange={(_, expandedItems) => setExpandedItems(expandedItems)}
                            checkboxSelection
                            multiSelect
                            selectionPropagation={DEFAULT_SELECTION_PROPAGATION}
                        />
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
