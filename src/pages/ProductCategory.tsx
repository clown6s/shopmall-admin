import * as React from 'react';
import Box from '@mui/material/Box';
import { styled, alpha } from '@mui/material/styles';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { toTreeViewItems } from '../types/product';
import { getProductCategoryTreeApi } from '../api/product';

const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
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
        // backgroundColor: theme.palette.primary.dark,
        padding: theme.spacing(0, 1.2),
        ...theme.applyStyles('light', {
            // backgroundColor: alpha(theme.palette.primary.main, 0.25),
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

export default function ProductCategory() {
    // 分类数据状态
    const [treeItems, setTreeItems] = React.useState<ReturnType<typeof toTreeViewItems>>([]);
    // const [setLoading] = React.useState(true);
    // const [setError] = React.useState<string | null>(null);

    // 加载分类数据
    const loadCategories = async () => {
        try {
            // setLoading(true);
            // setError(null);
            const res = await getProductCategoryTreeApi();
            const items = toTreeViewItems(res.data.data || []);
            setTreeItems(items);
        } catch (err) {
            console.error('加载分类失败:', err);
            // setError('加载分类数据失败，请重试');
        } finally {
            // setLoading(false);
        }
    };

    React.useEffect(() => {
        loadCategories();
    }, []);

    return (
        <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
            <Box sx={{ minHeight: 352, minWidth: 250,width: '300px',overflow: 'auto' }}>
                <RichTreeView
                    defaultExpandedItems={['grid']}
                    slots={{ item: CustomTreeItem }}
                    items={treeItems}
                />
            </Box>
        </Box>
    );
}
