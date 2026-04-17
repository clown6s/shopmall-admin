import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
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
    React.useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await getProductCategoryTreeApi();
                const items = toTreeViewItems(res.data.data || []);
                setTreeItems(items);
                // 默认全部折叠，不设置 expandedItems
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
        <div style={{ width: '100%' }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <Box sx={{ height: 'calc(100vh - 220px)', minWidth: 350, overflowY: 'auto' }}>
                    {treeItems.length === 0 ? (
                        <Typography color="text.secondary" sx={{ p: 2 }}>
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
                </Box>
            )}
        </div>
    );
}
