import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { styled, alpha } from '@mui/material/styles';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import * as React from "react";
import { toTreeViewItems } from "../types/product.ts";
import {getProductCategoryTreeApi} from "../api/product.ts";



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
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [items, setItems] = React.useState<ReturnType<typeof toTreeViewItems>>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

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
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200}}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box ref={containerRef} sx={{ width: 300, height: 'calc(100% - 50px)', overflow: 'auto' }}>
            <RichTreeView
                defaultExpandedItems={['grid']}
                slots={{ item: CustomTreeItem }}
                items={items}
            />
        </Box>
    );
}